import "./env";
import path from "path";
import fs from "fs-extra";
import {
  getBuiltWorkflow,
  getContext,
  getWorkflows,
  getEventByContext,
  log,
  buildNativeEvent,
  buildNativeSecrets,
  buildNativeEnv,
  buildWorkflowFile,
  ITriggerInternalResult,
  ITriggerBuildResult,
  AnyObject,
  ITriggerError,
  ITask,
} from "actionsflow-core";
import del from "del";
import { run as runTrigger, runSettled } from "./trigger";
import { LogLevelDesc } from "loglevel";
import { getTasksByTriggerEvent } from "./task";
import { TriggersError } from "./error";
import preBuild from "./pre-build";
import postBuild from "./post-build";
import { runAfter } from "./utils";
interface IBuildOptions {
  dest?: string;
  cwd?: string;
  include?: string[];
  exclude?: string[];
  force?: boolean;
  logLevel?: string;
  verbose?: boolean;
  jsonSecrets?: string;
  jsonGithub?: string;
}
const build = async (options: IBuildOptions = {}): Promise<void> => {
  preBuild();
  options = {
    dest: "./dist",
    cwd: process.cwd(),
    include: [],
    exclude: [],
    logLevel: "",
    verbose: false,
    force: false,
    jsonSecrets: "",
    jsonGithub: "",
    ...options,
  };
  let logLevel: LogLevelDesc | undefined;
  if (options.logLevel) {
    logLevel = options.logLevel as LogLevelDesc;
  } else if (options.verbose) {
    logLevel = "debug";
  }
  if (logLevel) {
    log.setLevel(logLevel);
  }
  log.debug("build: options", options);
  const { cwd, dest, include, exclude, force } = options;
  const destPath = path.resolve(cwd as string, dest as string);
  log.debug("destPath:", destPath);
  // clean the dest folder
  await del([destPath]);
  log.info("Clean the dest folder");
  const context = getContext({
    JSON_SECRETS: options.jsonSecrets || "",
    JSON_GITHUB: options.jsonGithub || "",
  });
  // create workflow dest dir
  const workflowsDestPath = path.resolve(destPath, "workflows");
  await fs.ensureDir(workflowsDestPath);
  // act need event.json and .secrets, event the workflows folder is empty
  // build native event
  await buildNativeEvent({
    dest: destPath,
    github: context.github,
  });

  // build secret file
  await buildNativeSecrets({
    dest: destPath,
    secrets: context.secrets,
  });

  // build env file
  await buildNativeEnv({
    dest: destPath,
  });

  // get all valid workflows
  const workflows = await getWorkflows({
    context,
    cwd: cwd as string,
    include,
    exclude,
  });

  // get event by context
  const triggerEvent = getEventByContext(context);
  // get trigger by trigger type such as webhook, scheduled, manual

  // get workflows that belong this type

  const tasks = await getTasksByTriggerEvent({
    event: triggerEvent,
    workflows,
    logLevel: logLevel,
  });

  // scheduled task
  log.debug(
    "tasks",
    JSON.stringify(
      tasks.map((item) => {
        return {
          relativePath: item.workflow.relativePath,
          trigger: {
            name: item.trigger.name,
            options: item.trigger.options,
          },
          event: item.event,
          type: item.type,
          timeout: item.timeout,
        };
      }),
      null,
      2
    )
  );

  const errors: ITriggerError[] = [];
  let tasksResults: PromiseSettledResult<ITriggerInternalResult>[] = [];
  // get immediate tasks
  const immediateTasks: ITask[] = [];
  const timeoutTasks: ITask[] = [];
  tasks.forEach((task) => {
    if (task.type === "timeout") {
      timeoutTasks.push(task);
    } else {
      immediateTasks.push(task);
    }
  });
  log.info(
    `There are ${immediateTasks.length} immediate tasks, ${timeoutTasks.length} timeout tasks`
  );
  const timeoutTasksPromises: Promise<ITriggerInternalResult>[] = [];

  // Add immediate tasks
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    // TODO check type
    const workflow = task.workflow;
    const trigger = task.trigger;
    const event = task.event;

    if (force) {
      if (trigger.options) {
        if (trigger.options.config) {
          trigger.options.config.force = true;
        } else {
          trigger.options.config = { force: true };
        }
      } else {
        trigger.options = { config: { force: true } };
      }
    }
    if (task.type === "immediate") {
      tasksResults.push(
        await runSettled({
          workflow: workflow,
          trigger: {
            name: trigger.name,
            options: trigger.options,
            class: trigger.class,
          },
          event: event,
          logLevel,
        })
      );
    } else {
      // Add timeout promise
      timeoutTasksPromises.push(
        runAfter(
          runTrigger.bind(null, {
            workflow: workflow,
            trigger: {
              name: trigger.name,
              options: trigger.options,
              class: trigger.class,
            },
            event: event,
            logLevel,
          }),
          task.timeout as number
        )
      );
    }
  }
  log.info("Run immediate tasks finished, wait for timeout tasks to finish...");
  tasksResults = tasksResults.concat(
    await Promise.allSettled(timeoutTasksPromises)
  );
  log.info("All tasks finished, wait for building...");

  // Add

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    // TODO check type
    const workflow = task.workflow;
    const trigger = task.trigger;
    const relativePathWithoutExt = workflow.relativePath
      .split(".")
      .slice(0, -1)
      .join(".");
    const destRelativePath = `${relativePathWithoutExt}-${task.trigger.name}.yml`;
    const destPath = path.resolve(workflowsDestPath, destRelativePath);
    // manual run trigger
    const triggerResults: ITriggerBuildResult[] = [];
    if (force) {
      if (trigger.options) {
        if (trigger.options.config) {
          trigger.options.config.force = true;
        } else {
          trigger.options.config = { force: true };
        }
      } else {
        trigger.options = { config: { force: true } };
      }
    }
    const taskResult = tasksResults[i];

    let triggerRunResult: ITriggerInternalResult | undefined;
    if (taskResult.status === "fulfilled") {
      triggerRunResult = taskResult.value;
    } else {
      // error
      // if buildOutputsOnError
      const error = taskResult.reason as Error;
      if (
        trigger.options &&
        trigger.options.config &&
        trigger.options.config.buildOutputsOnError
      ) {
        log.warn(
          `Run ${workflow.relativePath} trigger ${trigger.name} error: `,
          error
        );
        log.warn(
          "But the workflow will continue to run because buildOutputsOnError: true"
        );
        triggerResults.push({
          outputs: {},
          outcome: "failure",
          conclusion: "success",
        });
        continue;
      } else if (
        trigger.options &&
        trigger.options.config &&
        trigger.options.config.skipOnError === true
      ) {
        log.info(
          `Skip ${workflow.relativePath} trigger [${trigger.name}]`,
          `becaulse there is an error occurred at trigger ${trigger.name}: `,
          error
        );
        log.info(`Run trigger ${trigger.name} error: `, error);
        continue;
      } else {
        errors.push({
          error: error,
          trigger: trigger,
          workflow: workflow,
        });
        continue;
      }
    }
    if (
      triggerRunResult.conclusion === "success" &&
      triggerRunResult.items.length > 0
    ) {
      // only handle success, skip other status
      // check is need to run workflowTasks
      for (let index = 0; index < triggerRunResult.items.length; index++) {
        const outputs = triggerRunResult.items[index];
        triggerResults.push({
          outputs,
          conclusion: triggerRunResult.conclusion,
          outcome: triggerRunResult.outcome,
        });
      }
    }

    if (triggerResults.length > 0) {
      const newWorkflowFileData = await getBuiltWorkflow({
        workflow: workflow,
        trigger: {
          name: trigger.name,
          results: triggerResults,
        },
      });
      if (Object.keys(newWorkflowFileData.jobs as AnyObject).length > 0) {
        await buildWorkflowFile({
          workflowData: newWorkflowFileData,
          dest: destPath,
        });

        // success
        log.info(
          `${triggerResults.length} updates found at trigger [${trigger.name}] of workflow [${workflow.relativePath}], workflow file ${destRelativePath} build success`
        );
      } else {
        log.info("Skip generate workflow file: ", workflow.relativePath),
          " because of no jobs";
      }
    } else {
      log.info(
        `No new updates found at trigger [${trigger.name}] of workflow [${workflow.relativePath}], skip it.`
      );
    }
  }

  postBuild();
  // if errors.length>0, then throw Error
  if (errors.length > 0) {
    log.info("Actionsflow build finished with the following errors:");
    errors.forEach((error) => {
      log.info(
        `When running trigger [${error.trigger.name}] of workflow file [${error.workflow.relativePath}]: `,
        error.error
      );
    });
    throw new TriggersError(errors);
  }
  log.info("Done.");
};

export default build;
