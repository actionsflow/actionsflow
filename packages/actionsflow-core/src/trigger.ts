import chalk from "chalk";
import { createContentDigest, getCache, formatBinary, Cache } from "./helpers";
import { LogLevelDesc } from "loglevel";
import path from "path";
import {
  AnyObject,
  ITriggerClassType,
  IHelpers,
  IWorkflow,
  ITriggerGeneralConfigOptions,
  ITriggerOptions,
  ITriggerContructorParams,
  ITriggerEvent,
  ITriggerHelpersOptions,
  ManualRunTriggerEventType,
  ITriggerRunContext,
  OutputsMode,
} from "./interface";
import { getRawTriggers } from "./utils";
import axios from "axios";
import rssParser from "rss-parser";
import { getWorkflow } from "./workflow";
import { getContext } from "./context";
import { Log, prefix, colors, log } from "./log";
import axiosRetry from "axios-retry";
axiosRetry(axios, {
  retries: 0,
  retryDelay: axiosRetry.exponentialDelay,
});
export const getTriggerId = ({
  name,
  workflowRelativePath,
}: {
  name: string;
  workflowRelativePath: string;
}): string => {
  const triggerId = createContentDigest({
    name: name,
    path: workflowRelativePath,
  });
  return triggerId;
};

export const getTriggerCache = ({
  name,
  workflowRelativePath,
}: {
  name: string;
  workflowRelativePath: string;
}): Cache => {
  const triggerId = getTriggerId({
    name: name,
    workflowRelativePath: workflowRelativePath,
  });
  return getCache(`trigger-${name}-${triggerId}`);
};

export const getTriggerManageCache = ({
  name,
  workflowRelativePath,
}: {
  name: string;
  workflowRelativePath: string;
}): Cache => {
  const triggerId = getTriggerId({
    name: name,
    workflowRelativePath: workflowRelativePath,
  });
  return getCache(`trigger-cache-manager-${name}-${triggerId}`);
};

export const getTriggerHelpers = ({
  name,
  workflowRelativePath,
  logLevel,
}: ITriggerHelpersOptions): IHelpers => {
  const triggerLog = Log.getLogger(`Actionsflow-trigger [${name}]`);
  prefix.apply(triggerLog, {
    format(level, name, timestamp) {
      return `${chalk.gray(`[${timestamp}]`)} ${colors[level.toUpperCase()](
        level
      )} ${chalk.green(`${name}:`)}`;
    },
  });
  if (logLevel) {
    triggerLog.setDefaultLevel(logLevel);
  } else {
    triggerLog.setDefaultLevel(log.getLevel());
  }
  const triggerHelpers = {
    createContentDigest,
    formatBinary,
    cache: getTriggerCache({ name, workflowRelativePath }),
    log: triggerLog,
    axios: axios,
    rssParser: rssParser,
  };
  return triggerHelpers;
};
interface IGeneralTriggerOptions extends ITriggerGeneralConfigOptions {
  every: number | string;
  manualRunEvent: ManualRunTriggerEventType[];
  debug: boolean;
  shouldDeduplicate: boolean;
  skipSchedule: boolean;
  getItemKey: (item: AnyObject) => string;
  skipFirst: boolean;
  force: boolean;
  active: boolean;
  buildOutputsOnError: boolean;
  skipOnError: boolean;
  timeZone: string;
  outputsMode: OutputsMode;
  exportOutputs: boolean;
  outputsDir: string;
}
interface IGeneralTriggerDefaultOptions extends ITriggerGeneralConfigOptions {
  every: string | number;
  shouldDeduplicate: boolean;
  skipSchedule: boolean;
  manualRunEvent: ManualRunTriggerEventType | ManualRunTriggerEventType[];
  debug: boolean;
  skipFirst: boolean;
  force: boolean;
  active: boolean;
  buildOutputsOnError: boolean;
  skipOnError: boolean;
  timeZone: string;
  outputsMode: OutputsMode;
  exportOutputs: boolean;
  outputsDir: string;
}
export const getGeneralTriggerFinalOptions = (
  triggerInstance: ITriggerClassType,
  triggerOptions: ITriggerOptions,
  event: ITriggerEvent,
  optionalOptions?: {
    cwd?: string;
    dest?: string;
  }
): IGeneralTriggerOptions => {
  const instanceConfig = triggerInstance.config || {};
  let userOptions: ITriggerGeneralConfigOptions = {};
  if (triggerOptions && triggerOptions.config) {
    userOptions = triggerOptions.config;
  }
  let outputsDir = "dist/outputs";
  if (optionalOptions && optionalOptions.cwd) {
    let dest = `dist/outputs`;
    if (optionalOptions.dest) {
      dest = path.resolve(optionalOptions.dest, "outputs");
    }
    outputsDir = path.resolve(optionalOptions.cwd, dest);
  }
  const options: IGeneralTriggerDefaultOptions = {
    every: 0, // by the default, trigger will run every time when the github Actions workflow run.
    shouldDeduplicate: event.type === "webhook" ? false : true,
    manualRunEvent: [],
    skipSchedule: false,
    debug: false,
    skipFirst: false,
    force: false,
    active: true,
    buildOutputsOnError: false,
    skipOnError: false,
    timeZone: "UTC",
    outputsMode: "separate",
    exportOutputs: false,
    outputsDir: outputsDir,
    ...instanceConfig,
    ...userOptions,
  };

  // format event

  if (options.manualRunEvent) {
    if (typeof options.manualRunEvent === "string") {
      options.manualRunEvent = [options.manualRunEvent];
    } else if (Array.isArray(options.manualRunEvent)) {
      options.manualRunEvent = options.manualRunEvent;
    } else {
      // invalid event type
      throw new Error(
        `Invalid config event value, you should use one of "push", "schedule", "webhook", "repository_dispatch", "workflow_dispatch"`
      );
    }
  } else {
    options.manualRunEvent = [];
  }

  // debug
  if (options.debug) {
    options.logLevel = "debug";
    options.manualRunEvent = [
      "push",
      "repository_dispatch",
      "workflow_dispatch",
    ];
  }
  const finalEvents: ManualRunTriggerEventType[] = options.manualRunEvent as ManualRunTriggerEventType[];

  const newOptions: IGeneralTriggerOptions = {
    getItemKey: (item: AnyObject): string => {
      let key = "";
      if (item.id) {
        key = item.id as string;
      } else if (item.key) {
        key = item.key as string;
      } else if (item.guid) {
        key = item.guid as string;
      }
      if (key) {
        return createContentDigest(key);
      }
      return createContentDigest(item);
    },
    ...options,
    manualRunEvent: finalEvents,
  };
  if (options.shouldDeduplicate) {
    if (triggerInstance.getItemKey) {
      newOptions.getItemKey = (item: AnyObject) => {
        let key = "";
        if (triggerInstance.getItemKey) {
          key = triggerInstance.getItemKey.call(triggerInstance, item);
        }
        return createContentDigest(key);
      };
    }
  }

  return newOptions;
};

export const getTriggerConstructorParams = async ({
  globalOptions,
  name,
  cwd,
  workflowPath,
  workflow,
  options,
}: {
  name: string;
  cwd?: string;
  workflowPath?: string;
  workflow?: IWorkflow;
  globalOptions?: ITriggerGeneralConfigOptions;
  options?: ITriggerOptions;
}): Promise<ITriggerContructorParams> => {
  let theWorkflow: IWorkflow | undefined;
  if (workflow) {
    theWorkflow = workflow as IWorkflow;
  } else if (workflowPath) {
    cwd = cwd || process.cwd();

    theWorkflow = (await getWorkflow({
      path: workflowPath,
      cwd: cwd,
      context: getContext(),
    })) as IWorkflow;
  } else {
    throw new Error("Miss param workflowPath");
  }

  const triggerHelperOptions: ITriggerHelpersOptions = {
    name: name,
    workflowRelativePath: theWorkflow.relativePath,
  };

  let triggerOptions: ITriggerOptions = {};
  if (options) {
    triggerOptions = options;
  } else {
    const rawTriggers = getRawTriggers(theWorkflow.data, globalOptions);
    rawTriggers.forEach((trigger) => {
      if (trigger.name === name) {
        triggerOptions = trigger.options;
      }
    });
  }

  if (triggerOptions && triggerOptions.config) {
    if (triggerOptions.config.debug) {
      triggerHelperOptions.logLevel = "debug";
    } else if (triggerOptions.config.logLevel) {
      triggerHelperOptions.logLevel = triggerOptions.config
        .logLevel as LogLevelDesc;
    }
  }

  const triggerId = getTriggerId({
    name: name,
    workflowRelativePath: theWorkflow.relativePath,
  });
  const triggerCacheManager = getTriggerManageCache({
    name,
    workflowRelativePath: theWorkflow.relativePath,
  });
  const firstRunAt = await triggerCacheManager.get("firstRunAt");
  const triggerRunContext: ITriggerRunContext = {
    isFirstRun: firstRunAt ? false : true,
    triggerId: triggerId,
  };

  return {
    options: triggerOptions,
    helpers: getTriggerHelpers(triggerHelperOptions),
    workflow: theWorkflow,
    context: triggerRunContext,
  };
};
