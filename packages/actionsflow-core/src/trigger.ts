import chalk from "chalk";
import { createContentDigest, getCache, formatBinary } from "./helpers";
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
} from "./interface";
import axios from "axios";
import rssParser from "rss-parser";
import { getWorkflow } from "./workflow";
import { getContext } from "./context";
import { Log, prefix, colors } from "./log";

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

export const getTriggerHelpers = ({
  name,
  workflowRelativePath,
  logLevel,
}: ITriggerHelpersOptions): IHelpers => {
  const triggerId = getTriggerId({
    name: name,
    workflowRelativePath: workflowRelativePath,
  });
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
    triggerLog.setDefaultLevel("info");
  }
  const triggerHelpers = {
    createContentDigest,
    formatBinary,
    cache: getCache(`trigger-${name}-${triggerId}`),
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
  logLevel: LogLevelDesc;
  active: boolean;
  buildOutputsOnError: boolean;
  skipOnError: boolean;
  timeZone: string;
}
interface IGeneralTriggerDefaultOptions extends ITriggerGeneralConfigOptions {
  every: string | number;
  shouldDeduplicate: boolean;
  skipSchedule: boolean;
  manualRunEvent: ManualRunTriggerEventType | ManualRunTriggerEventType[];
  debug: boolean;
  skipFirst: boolean;
  force: boolean;
  logLevel: LogLevelDesc;
  active: boolean;
  buildOutputsOnError: boolean;
  skipOnError: boolean;
  timeZone: string;
}
export const getGeneralTriggerFinalOptions = (
  triggerInstance: ITriggerClassType,
  triggerOptions: ITriggerOptions,
  event: ITriggerEvent
): IGeneralTriggerOptions => {
  const instanceConfig = triggerInstance.config || {};
  let userOptions: ITriggerGeneralConfigOptions = {};
  if (triggerOptions && triggerOptions.config) {
    userOptions = triggerOptions.config;
  }
  const options: IGeneralTriggerDefaultOptions = {
    every: 0, // by the default, trigger will run every time when the github Actions workflow run.
    shouldDeduplicate: event.type === "webhook" ? false : true,
    manualRunEvent: [],
    skipSchedule: false,
    debug: false,
    skipFirst: false,
    force: false,
    logLevel: "info",
    active: true,
    buildOutputsOnError: false,
    skipOnError: false,
    timeZone: "UTC",
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
      }
      if (item.key) {
        key = item.key as string;
      }
      if (item.guid) {
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
  options,
  name,
  cwd,
  workflowPath,
}: {
  options: ITriggerOptions;
  name: string;
  cwd?: string;
  workflowPath: string;
}): Promise<ITriggerContructorParams> => {
  cwd = cwd || process.cwd();
  const relativePath = path.relative(
    path.resolve(cwd, "workflows"),
    workflowPath
  );
  const triggerHelperOptions: ITriggerHelpersOptions = {
    name: name,
    workflowRelativePath: relativePath,
  };
  if (options && options.logLevel) {
    triggerHelperOptions.logLevel = options.logLevel as LogLevelDesc;
  }
  return {
    options: options,
    helpers: getTriggerHelpers(triggerHelperOptions),
    workflow: (await getWorkflow({
      path: workflowPath,
      cwd: cwd,
      context: getContext(),
    })) as IWorkflow,
  };
};
