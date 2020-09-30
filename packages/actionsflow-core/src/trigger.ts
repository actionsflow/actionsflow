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
interface ITriggerHelpersOptions {
  name: string;
  workflowRelativePath: string;
  logLevel?: LogLevelDesc;
}
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
  every: number;
  shouldDeduplicate: boolean;
  getItemKey: (item: AnyObject) => string;
  skipFirst: boolean;
  force: boolean;
  logLevel: LogLevelDesc;
  active: boolean;
  buildOutputsOnError: boolean;
  skipOnError: boolean;
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
  const options: IGeneralTriggerOptions = {
    every: 0, // github actions every 5, here we can set 0,due to triggered by other event, like push
    shouldDeduplicate: event.type === "webhook" ? false : true,
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
    skipFirst: false,
    force: false,
    logLevel: "info",
    active: true,
    buildOutputsOnError: false,
    skipOnError: false,
    ...instanceConfig,
    ...userOptions,
  };

  if (options.shouldDeduplicate) {
    if (triggerInstance.getItemKey) {
      options.getItemKey = (item: AnyObject) => {
        let key = "";
        if (triggerInstance.getItemKey) {
          key = triggerInstance.getItemKey.call(triggerInstance, item);
        }
        return createContentDigest(key);
      };
    }
  }

  return options;
};

export const getTriggerConstructorParams = async ({
  options,
  name,
  cwd,
  workflowPath,
  logLevel,
}: {
  options: ITriggerOptions;
  name: string;
  cwd?: string;
  workflowPath: string;
  logLevel?: LogLevelDesc;
}): Promise<ITriggerContructorParams> => {
  cwd = cwd || process.cwd();
  const relativePath = path.relative(
    path.resolve(cwd, "workflows"),
    workflowPath
  );

  return {
    options: options,
    helpers: getTriggerHelpers({
      name: name,
      workflowRelativePath: relativePath,
      logLevel: logLevel,
    }),
    workflow: (await getWorkflow({
      path: workflowPath,
      cwd: cwd,
      context: getContext(),
    })) as IWorkflow,
  };
};
