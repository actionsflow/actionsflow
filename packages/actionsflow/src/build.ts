import "./env";
import path from "path";
import fs from "fs-extra";
import {
  getBuiltWorkflows,
  getContext,
  getWorkflows,
  getEventByContext,
  log,
  buildNativeEvent,
  buildNativeSecrets,
  buildNativeEnv,
  buildWorkflowFile,
  ITriggerInternalResult,
  AnyObject,
  ITriggerError,
  ITask,
} from "actionsflow-core";
import del from "del";
import { run as runTrigger } from "./trigger";
import { LogLevelDesc } from "loglevel";
import { getTasksByTriggerEvent } from "./task";
import { TriggersError } from "./error";
import preBuild from "./pre-build";
import postBuild from "./post-build";
import { runAfter, promiseSerial } from "./utils";
import allSettled from "promise.allsettled";
allSettled.shim(); // will be a no-op if not needed
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
  log.debug("build: options", {
    dest: options.dest,
    cwd: options.cwd,
    include: options.include,
    exclude: options.exclude,
    logLevel: options.logLevel,
    verbose: options.verbose,
    force: options.force,
  });
  const { cwd, dest, include, exclude, force } = options;
  const destPath = path.resolve(cwd as string, dest as string);
  // clean the dest folder
  await del([destPath]);
  log.info("Clean the dest folder...");
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
    globalOptions: {
      force: force,
      logLevel: logLevel,
    },
  });

  const errors: ITriggerError[] = [];
  // get immediate tasks
  const immediateTasks: ITask[] = [];
  const delayTasks: ITask[] = [];
  tasks.forEach((task) => {
    if (task.type === "delay") {
      delayTasks.push(task);
    } else {
      immediateTasks.push(task);
    }
  });
  const newTasks: ITask[] = immediateTasks.concat(delayTasks);
  log.info(
    `There are ${immediateTasks.length} immediate tasks, ${delayTasks.length} delay tasks`
  );
  const immediatePromises: (() => Promise<ITriggerInternalResult>)[] = [];

  const delayTasksPromises: Promise<ITriggerInternalResult>[] = [];

  // scheduled task
  log.debug(
    "tasks",
    JSON.stringify(
      newTasks.map((item) => {
        return {
          relativePath: item.workflow.relativePath,
          trigger: {
            name: item.trigger.name,
          },
          event: item.event,
          type: item.type,
          delay: item.delay,
        };
      }),
      null,
      2
    )
  );

  // run immediate tasks
  let tasksResults: PromiseSettledResult<ITriggerInternalResult>[] = [];

  // Add immediate tasks
  for (let i = 0; i < newTasks.length; i++) {
    const task = newTasks[i];
    // TODO check type
    const workflow = task.workflow;
    const trigger = task.trigger;
    const event = task.event;

    if (task.type === "immediate") {
      immediatePromises.push(
        runTrigger.bind(null, {
          workflow: workflow,
          trigger: {
            name: trigger.name,
            class: trigger.class,
            options: trigger.options,
          },
          event: event,
          logLevel,
        })
      );
    } else {
      // Add delay promise
      delayTasksPromises.push(
        runAfter(
          runTrigger.bind(null, {
            workflow: workflow,
            trigger: {
              name: trigger.name,
              class: trigger.class,
              options: trigger.options,
            },
            event: event,
            logLevel,
          }),
          task.delay as number
        )
      );
    }
  }

  tasksResults = await promiseSerial(immediatePromises);
  log.info(
    `Run ${tasksResults.length} immediate tasks finished, wait for ${delayTasksPromises.length} delay tasks to finish...`
  );
  tasksResults = tasksResults.concat(
    await Promise.allSettled(delayTasksPromises)
  );
  log.info("All tasks finished, wait for building...");
  // Add

  for (let i = 0; i < newTasks.length; i++) {
    const task = newTasks[i];
    // TODO check type
    const workflow = task.workflow;
    const trigger = task.trigger;
    const relativePathWithoutExt = workflow.relativePath
      .split(".")
      .slice(0, -1)
      .join(".");
    const destRelativePath = `${i}-${relativePathWithoutExt}-${task.trigger.name}.yml`;

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
        triggerRunResult = {
          items: [{}],
          outcome: "failure",
          conclusion: "success",
        };
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
        // TODO JSON.stringify, change type
        errors.push({
          error: error,
          trigger: trigger,
          workflow: workflow,
        });
        continue;
      }
    }

    if (triggerRunResult.items.length > 0) {
      const newWorkflowFileDatas = await getBuiltWorkflows({
        workflow: workflow,
        trigger: {
          name: trigger.name,
          results: triggerRunResult.items,
          outcome: triggerRunResult.outcome,
          conclusion: triggerRunResult.conclusion,
          outputsMode: trigger.outputsMode,
          outputsLength: trigger.outputsLength,
        },
      });
      for (let j = 0; j < newWorkflowFileDatas.length; j++) {
        const newWorkflowFileData = newWorkflowFileDatas[j];
        let workflowRelativeDestPath = `${destRelativePath}`;

        if (newWorkflowFileDatas.length > 1) {
          workflowRelativeDestPath = `${j}-${destRelativePath}`;
        }
        const workflowDestPath = path.resolve(
          workflowsDestPath,
          workflowRelativeDestPath
        );
        if (Object.keys(newWorkflowFileData.jobs as AnyObject).length > 0) {
          await buildWorkflowFile({
            workflowData: newWorkflowFileData,
            dest: workflowDestPath,
          });

          // success
          log.info(
            `${triggerRunResult.items.length} updates found at trigger [${trigger.name}] of workflow [${workflow.relativePath}], workflow file ${workflowRelativeDestPath} build success`
          );
        } else {
          log.info("Skip generate workflow file: ", workflow.relativePath),
            " because of no jobs";
        }
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
