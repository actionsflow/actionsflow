import {
  getGeneralTriggerFinalOptions,
  getThirdPartyTrigger,
  getGlobalThirdPartyTrigger,
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
  IInternalRunTrigger,
  IWebhookRequestPayload,
  ITrigger,
  getTriggerConstructorParams,
  ITriggerInternalOptions,
  getTriggerManageCache,
} from "actionsflow-core";
import Triggers from "./triggers";
const MAX_CACHE_KEYS_COUNT = 5000;

const allTriggers = Triggers as Record<string, ITriggerClassTypeConstructable>;

export const run = async ({
  trigger,
  event,
  workflow,
  cwd,
  dest,
}: ITriggerInternalOptions): Promise<ITriggerInternalResult> => {
  log.debug("Trigger event: ", event);
  const originLogLevel = log.getLevel();
  const finalResult: ITriggerInternalResult = {
    items: [],
    outcome: "success",
    conclusion: "success",
  };

  const Trigger = trigger.class;

  if (Trigger) {
    const triggerCacheManager = getTriggerManageCache({
      name: trigger.name,
      workflowRelativePath: workflow.relativePath,
    });
    const triggerConstructorParams = await getTriggerConstructorParams({
      name: trigger.name,
      workflow: workflow,
      options: trigger.options,
    });
    finalResult.helpers = triggerConstructorParams.helpers;
    const triggerInstance = new Trigger(triggerConstructorParams);

    let triggerResult: ITriggerResult | undefined;

    if (triggerInstance) {
      const triggerGeneralOptions = getGeneralTriggerFinalOptions(
        triggerInstance,
        trigger.options,
        event,
        {
          cwd,
          dest,
        }
      );
      const {
        shouldDeduplicate,
        limit,
        filter,
        filterOutputs,
        format,
        sort,
        skip,
        skipFirst,
        force,
        logLevel,
        filterScript,
        sortScript,
      } = triggerGeneralOptions;
      if (logLevel) {
        log.setLevel(logLevel);
      }
      log.debug(
        `Start to run trigger [${trigger.name}] of workflow [${workflow.relativePath}]`
      );
      try {
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
          } else {
            // skip
            throw new Error(
              `No webhook path matched request path, skip [${trigger.name}] trigger building`
            );
          }
        } else if (triggerInstance.run) {
          const runHandler = triggerInstance.run.bind(triggerInstance)();
          if (isPromise(runHandler)) {
            triggerResult = (await runHandler) as ITriggerResult;
          } else {
            triggerResult = runHandler as ITriggerResult;
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
            // filter outputs
            if (filterOutputs) {
              const filterOutpusCursor = filterFn(items, {}, filterOutputs);
              items = filterOutpusCursor.all();
            }
            // format outputs
            if (format) {
              items = items.map((item) => {
                try {
                  const newItem = getStringFunctionResult(format, {
                    item,
                    helpers: triggerConstructorParams.helpers,
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
            let cursor: Cursor | undefined;
            // filter
            if (filter) {
              cursor = filterFn(items, filter);
            }
            // filterScript

            if (filterScript) {
              items = items.filter((item, index) => {
                try {
                  const filterResult = getStringFunctionResult(filterScript, {
                    item,
                    index,
                    items,
                    helpers: triggerConstructorParams.helpers,
                  }) as Record<string, unknown>;
                  return filterResult;
                } catch (error) {
                  throw new Error(
                    `An error occurred in the ${workflow.relativePath} [${
                      trigger.name
                    }] filterScript function: ${error.toString()}`
                  );
                }
              });
            }

            if (sort) {
              if (!cursor) {
                cursor = filterFn(items, {});
              }
              cursor = cursor.sort(sort);
            }
            if (sortScript) {
              items.sort((a, b) => {
                try {
                  const sortResult = getStringFunctionResult(sortScript, {
                    a,
                    b,
                    items,
                    helpers: triggerConstructorParams.helpers,
                  }) as number;

                  return sortResult;
                } catch (error) {
                  throw new Error(
                    `An error occurred in the ${workflow.relativePath} [${
                      trigger.name
                    }] sortScript function: ${error.toString()}`
                  );
                }
              });
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

            // duplicate
            if (shouldDeduplicate === true && getItemKey) {
              // deduplicate
              // get cache
              deduplicationKeys =
                (await triggerCacheManager.get("deduplicationKeys")) || [];
              log.debug(
                `Get ${deduplicationKeys.length} cached deduplicationKeys`
              );

              const itemsKeyMaps = new Map();
              items.forEach((item) => {
                itemsKeyMaps.set(getItemKey(item), item);
              });
              items = [...itemsKeyMaps.values()];
              if (!force) {
                items = items.filter((result) => {
                  const key = getItemKey(result);
                  if ((deduplicationKeys as string[]).includes(key)) {
                    return false;
                  } else {
                    return true;
                  }
                });
              }

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
                log.debug(
                  `Save ${deduplicationKeys.length} deduplicationKeys to cache`
                );
              } else {
                log.debug("no items update, do not need to update cache");
              }
            }
          }
          // save first run status
          await triggerCacheManager.set("firstRunAt", Date.now());
          if (
            !(
              skipFirst && triggerConstructorParams.context.isFirstRun === true
            ) ||
            force
          ) {
            finalResult.items = items;
          }
        } else {
          log.debug("no items update, do not need to update cache");
        }
        log.setLevel(originLogLevel);
      } catch (e) {
        log.setLevel(originLogLevel);
        throw e;
      }
    } else {
      throw new Error(`Trigger [${trigger.name}] construct error`);
    }
  }
  log.debug(
    `End to run trigger [${trigger.name}] of workflow [${workflow.relativePath}] with ${finalResult.items.length} items`
  );
  return finalResult;
};
export const runSettled = async (
  options: ITriggerInternalOptions
): Promise<PromiseSettledResult<ITriggerInternalResult>> => {
  try {
    const value = await run(options);
    return {
      status: "fulfilled",
      value,
    };
  } catch (e) {
    return {
      status: "rejected",
      reason: e,
    };
  }
};
export const resolveTrigger = (
  name: string
): ITriggerClassTypeConstructable | undefined => {
  // check thirdparty support
  let trigger: ITriggerClassTypeConstructable | undefined;
  // first get local trigger
  trigger = getLocalTrigger(name);
  if (trigger) {
    log.debug(`Use local trigger [${name}]`);
  }

  // then, get third party trigger
  if (!trigger) {
    trigger = getThirdPartyTrigger(name);
    if (trigger) {
      log.debug(`Use third party trigger [${name}]`);
    }
  }
  // last, get official trigger
  if (!trigger) {
    trigger = allTriggers[name];
    if (trigger) {
      log.debug(`Use official trigger [${name}]`);
    }
  }

  // last last, get global trigger
  if (!trigger) {
    trigger = getGlobalThirdPartyTrigger(name);
    if (trigger) {
      log.debug(`Use global third party trigger [${name}]`);
    }
  }
  return trigger;
};

export const getSupportedTriggers = (
  rawTriggers: ITrigger[]
): IInternalRunTrigger[] => {
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
