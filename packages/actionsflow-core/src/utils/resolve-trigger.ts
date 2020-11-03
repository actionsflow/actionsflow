import resolveCwd from "resolve-cwd";
import resolveGlobal from "resolve-global";
import { ITriggerClassTypeConstructable } from "../interface";
import { log } from "../log";

export const getThirdPartyTrigger = (
  triggerName: string
): ITriggerClassTypeConstructable | undefined => {
  log.trace(`Try to find trigger [${triggerName}] at third party`);

  // TODO get @scope/actionsflow-trigger-xxxx

  let thirdPartyTrigger = `@actionsflow/trigger-${triggerName}`;
  log.trace("Try to find trigger at package: ", thirdPartyTrigger);
  let triggerPath = resolveCwd.silent(thirdPartyTrigger);

  if (!triggerPath) {
    thirdPartyTrigger = `actionsflow-trigger-${triggerName}`;
    log.trace("Try to find trigger at package: ", thirdPartyTrigger);
    triggerPath = resolveCwd.silent(thirdPartyTrigger);
  }

  if (!triggerPath) {
    // try to resolve the direct package
    log.trace("Try to find trigger at package: ", triggerName);
    triggerPath = resolveCwd.silent(triggerName);
  }

  if (triggerPath) {
    log.trace("Found third party trigger at: ", triggerPath);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Trigger = require(triggerPath);
    if (Trigger.default) {
      return Trigger.default;
    } else {
      return Trigger;
    }
  } else {
    log.trace(`Cannot find trigger [${triggerName}] at third party`);
    return undefined;
  }
};
export const getGlobalThirdPartyTrigger = (
  triggerName: string
): ITriggerClassTypeConstructable | undefined => {
  log.trace(`Try to find trigger [${triggerName}] at global third party`);

  // TODO get @scope/actionsflow-trigger-xxxx

  let thirdPartyTrigger = `@actionsflow/trigger-${triggerName}`;
  log.trace("Try to find trigger at package: ", thirdPartyTrigger);
  let triggerPath = resolveGlobal.silent(thirdPartyTrigger);

  if (!triggerPath) {
    thirdPartyTrigger = `actionsflow-trigger-${triggerName}`;
    log.trace("Try to find trigger at package: ", thirdPartyTrigger);
    triggerPath = resolveGlobal.silent(thirdPartyTrigger);
  }

  if (!triggerPath) {
    // try to resolve the direct package
    log.trace("Try to find trigger at package: ", triggerName);
    triggerPath = resolveGlobal.silent(triggerName);
  }

  if (triggerPath) {
    log.trace("Found third party trigger at: ", triggerPath);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Trigger = require(triggerPath);
    if (Trigger.default) {
      return Trigger.default;
    } else {
      return Trigger;
    }
  } else {
    log.trace(`Cannot find trigger [${triggerName}] at global third party`);
    return undefined;
  }
};

export const getLocalTrigger = (
  triggerName: string
): ITriggerClassTypeConstructable | undefined => {
  // first resolve local triggers
  log.trace(`Try to find trigger [${triggerName}] at local trigger`);
  log.trace(`Try to find trigger at ./triggers/${triggerName}`);
  const triggerPath = resolveCwd.silent(`./triggers/${triggerName}`);
  if (triggerPath) {
    log.trace("Found local trigger at: ", triggerPath);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Trigger = require(triggerPath);
    if (Trigger.default) {
      return Trigger.default;
    } else {
      return Trigger;
    }
  } else {
    return undefined;
  }
};
