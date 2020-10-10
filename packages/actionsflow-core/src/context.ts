import { ITriggerContext, IGithub, IContextEnv } from "./interface";
import { log } from "./log";
export const getContext = (contextEnv?: IContextEnv): ITriggerContext => {
  let secretObj: Record<string, string> = {};

  const secretStr =
    (contextEnv && contextEnv.JSON_SECRETS) || process.env.JSON_SECRETS || "{}";
  const githubStr =
    (contextEnv && contextEnv.JSON_GITHUB) || process.env.JSON_GITHUB || "{}";
  try {
    if (secretStr) {
      secretObj = JSON.parse(secretStr);
    }
    if (!secretObj) {
      secretObj = {};
    }
  } catch (error) {
    log.warn("parse enviroment variable JSON_SECRETS error:", error);
  }
  let githubObj: IGithub = {
    event: {},
  };
  try {
    if (githubStr) {
      githubObj = JSON.parse(githubStr);
    }
    if (!githubObj) {
      githubObj = { event: {} };
    }
  } catch (error) {
    log.warn("parse enviroment variable JSON_GITHUB error:", error);
  }
  if (!githubObj.event_name) {
    githubObj.event_name = "workflow_dispatch";
  }
  const context: ITriggerContext = {
    secrets: secretObj,
    github: githubObj,
  };
  return context;
};
