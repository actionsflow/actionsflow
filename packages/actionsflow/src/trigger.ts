import {
  getCache,
  getTriggerId,
  getTriggerHelpers,
  getGeneralTriggerFinalOptions,
  getThirdPartyTrigger,
  isPromise,
  log,
  getWebhookByRequest,
  Cursor,
  getLocalTrigger,
  filter as filterFn,
  getStringFunctionResult,
  ITriggerInternalResult,
  AnyObject,
  ITriggerClassTypeConstructable,
  ITriggerResult,
  ITriggerResultObject,
  IWorkflow,
  ITaskTrigger,
  ITriggerEvent,
  IWebhookRequestPayload,
  ITrigger,
} from "actionsflow-core";
import { LogLevelDesc } from "loglevel";
import Triggers from "./triggers";

const MAX_CACHE_KEYS_COUNT = 5000;
interface ITriggerInternalOptions {
  trigger: ITaskTrigger;
  workflow: IWorkflow;
  event: ITriggerEvent;
  logLevel?: LogLevelDesc;
}
interface ITriggerHelpersOptions {
  name: string;
  workflowRelativePath: string;
  logLevel?: LogLevelDesc;
}

const allTriggers = Triggers as Record<string, ITriggerClassTypeConstructable>;

export const run = async ({
  trigger,
  event,
  workflow,
  logLevel,
}: ITriggerInternalOptions): Promise<ITriggerInternalResult> => {
  log.debug("trigger:", trigger);
  log.debug("trigger event", event);
  const finalResult: ITriggerInternalResult = {
    items: [],
    outcome: "success",
    conclusion: "success",
  };

  const Trigger = trigger.class;

  if (Trigger) {
    const triggerHelperOptions: ITriggerHelpersOptions = {
      name: trigger.name,
      workflowRelativePath: workflow.relativePath,
    };
    if (trigger.options && trigger.options.logLevel) {
      triggerHelperOptions.logLevel = trigger.options.logLevel as LogLevelDesc;
    } else if (logLevel) {
      triggerHelperOptions.logLevel = logLevel;
    }
    const triggerHelpers = getTriggerHelpers(triggerHelperOptions);
    finalResult.helpers = triggerHelpers;
    const triggerInstance = new Trigger({
      helpers: triggerHelpers,
      options: trigger.options || {},
      workflow: workflow,
    });

    let triggerResult: ITriggerResult | undefined;
    const triggerId = getTriggerId({
      name: trigger.name,
      workflowRelativePath: workflow.relativePath,
    });
    const triggerCacheManager = getCache(
      `trigger-cache-manager-${trigger.name}-${triggerId}`
    );

    if (triggerInstance) {
      const triggerGeneralOptions = getGeneralTriggerFinalOptions(
        triggerInstance,
        trigger.options,
        event
      );
      const {
        every,
        shouldDeduplicate,
        limit,
        filter,
        filterOutputs,
        format,
        sort,
        skip,
        skipFirst,
        force,
      } = triggerGeneralOptions;
      // last update at, first find at env
      const lastUpdateAtFromEnv = process.env.ACTIONSFLOW_LAST_UPDATE_AT;
      let lastUpdateAtTimeFromEnv: number | undefined;
      if (lastUpdateAtFromEnv && process.env.GITHUB_ACTIONS === "true") {
        log.debug("last Update At From Env", lastUpdateAtFromEnv);
        lastUpdateAtTimeFromEnv = new Date(
          Number(lastUpdateAtFromEnv)
        ).getTime();
        if (isNaN(lastUpdateAtTimeFromEnv)) {
          lastUpdateAtTimeFromEnv = undefined;
        } else {
          log.debug("get last update at from env", lastUpdateAtTimeFromEnv);
        }
      }
      const lastUpdatedAt =
        lastUpdateAtTimeFromEnv ||
        (await triggerCacheManager.get("lastUpdatedAt")) ||
        0;
      log.debug("lastUpdatedAt: ", lastUpdatedAt);
      if (event.type === "webhook" && triggerInstance.webhooks) {
        // webhook event should call webhook method
        // lookup specific webhook event
        // call webhooks
        const webhook = getWebhookByRequest({
          webhooks: triggerInstance.webhooks,
          request: event.request as IWebhookRequestPayload,
          workflow,
          trigger: { name: trigger.name, options: trigger.options },
        });

        if (webhook) {
          log.debug("detect webhook", webhook);
          // check if specific getItemKey at Webhook
          if (webhook.getItemKey) {
            triggerGeneralOptions.getItemKey = webhook.getItemKey.bind(
              triggerInstance
            );
          }
          const webhookHandlerResult = webhook.handler.bind(triggerInstance)(
            webhook.request
          );
          if (isPromise(webhookHandlerResult)) {
            triggerResult = (await webhookHandlerResult) as ITriggerResult;
          } else {
            triggerResult = webhookHandlerResult as ITriggerResult;
          }
          if (process.env.GITHUB_ACTIONS !== "true") {
            log.debug("save last update at at cache for locally");
            // only save at local run, not for github enviroment
            await triggerCacheManager.set("lastUpdatedAt", Date.now());
          }
        } else {
          // skip
          throw new Error(
            `No webhook path matched request path, skip [${trigger.name}] trigger building`
          );
        }
      } else if (triggerInstance.run) {
        // updateInterval

        // check if should update
        // unit minutes
        // get latest update time
        const shouldUpdateUtil =
          (Number(lastUpdatedAt) as number) + every * 60 * 1000;
        const now = Date.now();

        const shouldUpdate = force || shouldUpdateUtil - now <= 0;
        log.debug("shouldUpdate:", shouldUpdate);
        // write to cache
        if (!shouldUpdate) {
          finalResult.outcome = "skipped";
          finalResult.conclusion = "skipped";
          triggerResult = [];
        } else {
          // check should run
          // scheduled event call run method
          const runHandler = triggerInstance.run.bind(triggerInstance)();
          if (isPromise(runHandler)) {
            triggerResult = (await runHandler) as ITriggerResult;
          } else {
            triggerResult = runHandler as ITriggerResult;
          }
          if (process.env.GITHUB_ACTIONS !== "true") {
            log.debug("save last update at at cache for locally");
            await triggerCacheManager.set("lastUpdatedAt", Date.now());
          }
        }
      } else {
        //  skipped, no method for the event type
        finalResult.outcome = "skipped";
        finalResult.conclusion = "skipped";
        triggerResult = [];
      }

      if (triggerResult) {
        let triggerResultFormat: ITriggerResultObject = {
          items: [],
        };
        let deduplicationKeys: string[] = [];
        const { getItemKey } = triggerGeneralOptions;
        if (Array.isArray(triggerResult)) {
          triggerResultFormat.items = triggerResult;
        } else {
          triggerResultFormat = triggerResult as ITriggerResultObject;
        }
        let items = triggerResultFormat.items;
        if (!Array.isArray(items)) {
          throw new Error(
            `trigger [${
              trigger.name
            }] returns an invalid results: ${JSON.stringify(
              triggerResult,
              null,
              2
            )}`
          );
        }
        if (items.length > 0) {
          // duplicate
          if (shouldDeduplicate === true && getItemKey && !force) {
            // deduplicate
            // get cache
            deduplicationKeys =
              (await triggerCacheManager.get("deduplicationKeys")) || [];
            log.debug("get cached deduplicationKeys", deduplicationKeys);
            const itemsKeyMaps = new Map();
            items.forEach((item) => {
              itemsKeyMaps.set(getItemKey(item), item);
            });
            items = [...itemsKeyMaps.values()];
            items = items.filter((result) => {
              const key = getItemKey(result);
              if ((deduplicationKeys as string[]).includes(key)) {
                return false;
              } else {
                return true;
              }
            });
          }
          let cursor: Cursor | undefined;
          // filter
          if (filter) {
            cursor = filterFn(items, filter);
          }

          if (sort) {
            if (!cursor) {
              cursor = filterFn(items, {});
            }
            cursor = cursor.sort(sort);
          }
          if (cursor) {
            items = cursor.all();
          }
          if (skip && skip > 0) {
            items = items.slice(skip, items.length);
          }

          if (limit && limit > 0) {
            items = items.slice(0, limit);
          }

          if (shouldDeduplicate === true && getItemKey && !force) {
            // set deduplicate key
            // if save to cache
            // items should use raw items
            if (items.length > 0) {
              deduplicationKeys = (deduplicationKeys as string[]).concat(
                items
                  .map((item: AnyObject) => getItemKey(item))
                  .filter((item) => {
                    if (deduplicationKeys.includes(item)) {
                      return false;
                    } else {
                      return true;
                    }
                  })
              );

              // deduplicate, just in case

              deduplicationKeys = [...new Set(deduplicationKeys)];

              deduplicationKeys = (deduplicationKeys as string[]).slice(
                -MAX_CACHE_KEYS_COUNT
              );

              // set cache
              await triggerCacheManager.set(
                "deduplicationKeys",
                deduplicationKeys
              );
              log.debug("save deduplicationKeys to cache", deduplicationKeys);
            } else {
              log.warn("no items update, do not need to update cache");
            }
          }

          // last filter outputs
          if (filterOutputs) {
            const filterOutpusCursor = filterFn(items, {}, filterOutputs);
            items = filterOutpusCursor.all();
          }
          // last format outputs
          if (format) {
            items = items.map((item) => {
              try {
                const newItem = getStringFunctionResult(format, {
                  item,
                }) as Record<string, unknown>;
                return newItem;
              } catch (error) {
                throw new Error(
                  `An error occurred in the ${workflow.relativePath} [${
                    trigger.name
                  }] format function: ${error.toString()}`
                );
              }
            });
          }
        }

        if (!(skipFirst && lastUpdatedAt === 0) || force) {
          finalResult.items = items;
        }

        return finalResult;
      } else {
        log.debug("no items update, do not need to update cache");
      }
    } else {
      throw new Error(`Trigger [${trigger.name}] construct error`);
    }
  }
  return finalResult;
};
export const resolveTrigger = (
  name: string
): ITriggerClassTypeConstructable | undefined => {
  // check thirdparty support
  let trigger: ITriggerClassTypeConstructable | undefined;
  // first get local trigger
  trigger = getLocalTrigger(name);

  // then, get third party trigger
  if (!trigger) {
    trigger = getThirdPartyTrigger(name);
  }
  // last, get official trigger
  if (!trigger) {
    trigger = allTriggers[name];
  }
  return trigger;
};

export const getSupportedTriggers = (
  rawTriggers: ITrigger[]
): ITaskTrigger[] => {
  const triggers = [];
  for (let index = 0; index < rawTriggers.length; index++) {
    const trigger = rawTriggers[index];
    const name = trigger.name;
    const triggerOptions = trigger.options || {};
    // is active
    if (triggerOptions.config && triggerOptions.config.active === false) {
      continue;
    }
    // check thirdparty support
    const triggerClass = resolveTrigger(name);
    if (!triggerClass) {
      log.warn(
        `can not found the trigger [${name}]. Did you forget to install the third party trigger?
  Try \`npm i @actionsflow/trigger-${name}\` if it exists.
  `
      );
    }
    if (triggerClass) {
      // valid event
      triggers.push({
        ...trigger,
        class: triggerClass,
      });
    }
  }
  return triggers;
};
