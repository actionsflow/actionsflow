import {
  getRawTriggers,
  log,
  Log,
  getParamsByWebhookPath,
  getWorkflowFileNameByPath,
  ITask,
  ITriggerEvent,
  IWorkflow,
  IWebhookRequest,
  getTriggerHelpers,
  ITriggerHelpersOptions,
  ITriggerClassTypeConstructable,
  getGeneralTriggerFinalOptions,
  getScheduler,
  TaskType,
} from "actionsflow-core";
import { RUN_INTERVAL } from "./constans";
import { getSupportedTriggers, resolveTrigger } from "./trigger";
import { getLastUpdatedAt, getCurrentJobCreatedAt } from "./job";
export const getTasksByTriggerEvent = async ({
  event,
  workflows,
  logLevel,
}: {
  event: ITriggerEvent;
  workflows: IWorkflow[];
  logLevel?: Log.LogLevelDesc;
}): Promise<ITask[]> => {
  const tasks: ITask[] = [];
  if (event.type === "webhook") {
    const request = event.request as IWebhookRequest;
    const webhookPath = request.path;
    const webhookParams = getParamsByWebhookPath(webhookPath);
    if (webhookParams) {
      for (let i = 0; i < workflows.length; i++) {
        const workflow = workflows[i];
        const workflowFileName = getWorkflowFileNameByPath(
          workflow.relativePath
        );
        const rawTriggers = getRawTriggers(workflow.data);
        // get support and active triggers.
        for (let j = 0; j < rawTriggers.length; j++) {
          const trigger = rawTriggers[j];
          if (
            trigger.name === webhookParams.triggerName &&
            webhookParams.workflowFileName === workflowFileName
          ) {
            const TriggerClass = resolveTrigger(trigger.name);
            if (TriggerClass) {
              tasks.push({
                workflow: workflow,
                trigger: { ...trigger, class: TriggerClass },
                event: event,
                type: "immediate",
              });
            } else {
              log.warn(
                `can not found the trigger [${trigger.name}]. Did you forget to install the third party trigger?
          Try \`npm i @actionsflow/trigger-${trigger.name}\` if it exists.
          `
              );
            }
          }
        }
      }
    }

    if (tasks.length === 0) {
      log.info(
        `The webhook request path [${webhookPath}] does not match any workflow triggers, Actionsflow will skip building for this time`
      );
    }
  } else if (event.type === "schedule") {
    // schedule
    const currentJobRunCreatedAt = getCurrentJobCreatedAt();
    const currentJobEndTime = currentJobRunCreatedAt + RUN_INTERVAL;

    for (let i = 0; i < workflows.length; i++) {
      const workflow = workflows[i];
      const rawTriggers = getRawTriggers(workflow.data);
      // get all support and active triggers
      const supportedTriggers = getSupportedTriggers(rawTriggers);
      // manual run trigger
      for (let j = 0; j < supportedTriggers.length; j++) {
        const trigger = supportedTriggers[j];
        const triggerHelperOptions: ITriggerHelpersOptions = {
          name: trigger.name,
          workflowRelativePath: workflow.relativePath,
        };
        if (trigger.options && trigger.options.logLevel) {
          triggerHelperOptions.logLevel = trigger.options
            .logLevel as Log.LogLevelDesc;
        } else if (logLevel) {
          triggerHelperOptions.logLevel = logLevel;
        }
        const triggerInstance = new (trigger.class as ITriggerClassTypeConstructable)(
          {
            options: trigger.options,
            helpers: getTriggerHelpers(triggerHelperOptions),
            workflow: workflow,
          }
        );
        const triggerGeneralOptions = getGeneralTriggerFinalOptions(
          triggerInstance,
          trigger.options,
          event
        );
        const { every, timeZone } = triggerGeneralOptions;
        const scheduler = getScheduler({ every, timeZone });
        const lastUpdatedAt = await getLastUpdatedAt();
        if (scheduler.type === "timeout") {
          // first check is prev has run,

          let isShouldUpdate = false;
          let taskRunType: TaskType = "timeout";
          let timeout: number | undefined = 0;
          const isFirstRun = lastUpdatedAt === 0;
          const prevTaskShouldRunAt = scheduler.prev as number;
          const nextTaskShouldRunAt = scheduler.next as number;
          let currentJobStartTime = lastUpdatedAt + RUN_INTERVAL;
          if (isFirstRun) {
            currentJobStartTime = currentJobRunCreatedAt;
          }
          log.debug(
            `isFirstRun: ${isFirstRun}
lastUpdatedAt: ${isFirstRun ? 0 : new Date(lastUpdatedAt)}
prevTaskShouldRunAt: ${new Date(prevTaskShouldRunAt)}
nextTaskShouldRunAt: ${new Date(nextTaskShouldRunAt)}
currentJobStartTime: ${new Date(currentJobStartTime)}
currentJobEndTime: ${new Date(currentJobEndTime)}
currentJobCreateTime: ${new Date(currentJobRunCreatedAt)}`
          );
          if (currentJobStartTime < prevTaskShouldRunAt) {
            isShouldUpdate = true;
            taskRunType = "immediate";
          } else if (nextTaskShouldRunAt <= currentJobEndTime) {
            isShouldUpdate = true;
            taskRunType = "timeout";
            timeout = nextTaskShouldRunAt - currentJobRunCreatedAt;
          }

          if (isShouldUpdate) {
            log.debug(
              `Trigger [${trigger.name}] of [${workflow.relativePath}] should be update, schedule type: ${taskRunType}, timeout: ${timeout}`
            );
            tasks.push({
              workflow: workflow,
              trigger: trigger,
              event: event,
              type: taskRunType,
              timeout: timeout,
            });
          } else {
            log.debug(
              `The task does not need to update, next run will be ${new Date(
                nextTaskShouldRunAt
              )}`
            );
          }
        } else {
          tasks.push({
            workflow: workflow,
            trigger: trigger,
            event: event,
            type: "immediate",
          });
        }
        // check is trigger should be triggered at the moment
        // get last run at
      }
    }
  } else if (event.type === "manual") {
    // manual
    for (let i = 0; i < workflows.length; i++) {
      const workflow = workflows[i];
      const rawTriggers = getRawTriggers(workflow.data);
      // get all support and active triggers
      const supportedTriggers = getSupportedTriggers(rawTriggers);
      // manual run trigger
      for (let j = 0; j < supportedTriggers.length; j++) {
        const trigger = supportedTriggers[j];
        // TODO if need to check is trigger should trigger should be run
        tasks.push({
          workflow: workflow,
          trigger: trigger,
          event: event,
          type: "immediate",
        });
      }
    }
  } else {
    log.info(
      `Skip event ${event.type}, Actionsflow will do nothing for this event now.`
    );
  }
  return tasks;
};
