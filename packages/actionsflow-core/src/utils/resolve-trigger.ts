import resolveCwd from "resolve-cwd";
import { ITriggerClassTypeConstructable } from "../interface";
import { log } from "../log";

export const getThirdPartyTrigger = (
  triggerName: string
): ITriggerClassTypeConstructable | undefined => {
  log.debug(`Try to find trigger [${triggerName}] at third party`);

  // TODO get @scope/actionsflow-trigger-xxxx

  let thirdPartyTrigger = `@actionsflow/trigger-${triggerName}`;
  log.debug("Try to find trigger at package: ", thirdPartyTrigger);
  let triggerPath = resolveCwd.silent(thirdPartyTrigger);

  if (!triggerPath) {
    thirdPartyTrigger = `actionsflow-trigger-${triggerName}`;
    log.debug("Try to find trigger at package: ", thirdPartyTrigger);
    triggerPath = resolveCwd.silent(thirdPartyTrigger);
  }

  if (!triggerPath) {
    // try to resolve the direct package
    log.debug("Try to find trigger at package: ", triggerName);
    triggerPath = resolveCwd.silent(triggerName);
  }

  if (triggerPath) {
    log.debug("Found third party trigger at: ", triggerPath);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Trigger = require(triggerPath);
    if (Trigger.default) {
      return Trigger.default;
    } else {
      return Trigger;
    }
  } else {
    log.debug(`Cannot find trigger [${triggerName}] at third party`);
    return undefined;
  }
};

export const getLocalTrigger = (
  triggerName: string
): ITriggerClassTypeConstructable | undefined => {
  // first resolve local triggers
  log.debug(`Try to find trigger [${triggerName}] at local trigger`);
  log.debug(`Try to find trigger at ./triggers/${triggerName}`);
  const triggerPath = resolveCwd.silent(`./triggers/${triggerName}`);
  if (triggerPath) {
    log.debug("Found local trigger at: ", triggerPath);
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
