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
} from "actionsflow-core";
import del from "del";
import { run as runTrigger } from "./trigger";
import { LogLevelDesc } from "loglevel";
import { getTasksByTriggerEvent } from "./task";

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
  log.info("clean the dest folder");
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

  const tasks = getTasksByTriggerEvent({
    event: triggerEvent,
    workflows,
  });

  // scheduled task
  log.debug(
    "tasks",
    JSON.stringify(
      tasks.map((item) => {
        return {
          relativePath: item.workflow.relativePath,
          trigger: item.trigger,
          event: item.event,
        };
      }),
      null,
      2
    )
  );

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const workflow = task.workflow;
    const trigger = task.trigger;
    const event = task.event;
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
    let triggerRunResult: ITriggerInternalResult | undefined;
    try {
      triggerRunResult = await runTrigger({
        workflow: workflow,
        trigger: {
          name: trigger.name,
          options: trigger.options,
          class: trigger.class,
        },
        event: event,
        logLevel,
      });
    } catch (error) {
      // if buildOutputsOnError
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
        throw error;
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

  log.info("Done.");
};

export default build;
