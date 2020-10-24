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
  ITriggerHelpersOptions,
  ITriggerClassTypeConstructable,
  getGeneralTriggerFinalOptions,
  getScheduler,
  TaskType,
  ITriggerGeneralConfigOptions,
  getTriggerConstructorParams,
  ITaskTrigger,
} from "actionsflow-core";
import { RUN_INTERVAL } from "./constans";
import { getSupportedTriggers, resolveTrigger } from "./trigger";
import { getLastUpdatedAt, getCurrentJobCreatedAt } from "./job";
import { isManualEvent, shouldRunMannually } from "./utils";
export const getTasksByTriggerEvent = async ({
  event,
  workflows,
  globalOptions,
}: {
  event: ITriggerEvent;
  workflows: IWorkflow[];
  globalOptions?: ITriggerGeneralConfigOptions;
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
        const rawTriggers = getRawTriggers(workflow.data, globalOptions);
        // get support and active triggers.
        for (let j = 0; j < rawTriggers.length; j++) {
          const trigger = rawTriggers[j];
          if (
            trigger.name === webhookParams.triggerName &&
            webhookParams.workflowFileName === workflowFileName
          ) {
            const TriggerClass = resolveTrigger(trigger.name);
            if (TriggerClass) {
              const triggerConstructorParams = await getTriggerConstructorParams(
                {
                  name: trigger.name,
                  workflow: workflow,
                  globalOptions: globalOptions,
                  options: trigger.options,
                }
              );
              const triggerInstance = new (TriggerClass as ITriggerClassTypeConstructable)(
                triggerConstructorParams
              );
              const triggerGeneralOptions = getGeneralTriggerFinalOptions(
                triggerInstance,
                trigger.options,
                event
              );
              tasks.push({
                workflow: workflow,
                trigger: {
                  name: trigger.name,
                  options: trigger.options,
                  class: TriggerClass,
                  outputsMode: triggerGeneralOptions.outputsMode,
                  resultsPerWorkflow: triggerGeneralOptions.resultsPerWorkflow,
                },
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
  } else if (event.type === "schedule" || isManualEvent(event.type)) {
    // schedule
    const currentJobRunCreatedAt = getCurrentJobCreatedAt();
    const currentJobEndTime = currentJobRunCreatedAt + RUN_INTERVAL;

    for (let i = 0; i < workflows.length; i++) {
      const workflow = workflows[i];

      const rawTriggers = getRawTriggers(workflow.data, globalOptions);
      // get all support and active triggers
      const supportedTriggers = getSupportedTriggers(rawTriggers);
      // manual run trigger
      for (let j = 0; j < supportedTriggers.length; j++) {
        const trigger: ITaskTrigger = {
          ...supportedTriggers[j],
          outputsMode: "separate",
        };
        const triggerHelperOptions: ITriggerHelpersOptions = {
          name: trigger.name,
          workflowRelativePath: workflow.relativePath,
        };

        if (trigger.options && trigger.options.logLevel) {
          triggerHelperOptions.logLevel = trigger.options
            .logLevel as Log.LogLevelDesc;
        }
        const triggerConstructorParams = await getTriggerConstructorParams({
          name: trigger.name,
          workflow: workflow,
          globalOptions: globalOptions,
          options: trigger.options,
        });
        const triggerInstance = new (trigger.class as ITriggerClassTypeConstructable)(
          triggerConstructorParams
        );
        const triggerGeneralOptions = getGeneralTriggerFinalOptions(
          triggerInstance,
          trigger.options,
          event
        );
        const {
          every,
          timeZone,
          manualRunEvent,
          force,
          skipSchedule,
          outputsMode,
          resultsPerWorkflow,
        } = triggerGeneralOptions;

        trigger.outputsMode = outputsMode;
        if (resultsPerWorkflow) {
          trigger.resultsPerWorkflow = resultsPerWorkflow;
        }
        const scheduler = getScheduler({ every, timeZone });
        const lastUpdatedAt = await getLastUpdatedAt();

        if (!triggerInstance.run) {
          // trigger do not have run method
          // do nothing
          log.debug(
            `There is no 'run' method at trigger [${trigger.name}] of workflow [${workflow.relativePath}], skip this trigger for tasks`
          );
        } else if (
          force ||
          (isManualEvent(event.type) &&
            shouldRunMannually(event.type, manualRunEvent))
        ) {
          log.debug(
            `trigger [${trigger.name}] of workflow [${workflow.relativePath}] should be run manually`
          );
          tasks.push({
            workflow: workflow,
            trigger: trigger,
            event: event,
            type: "immediate",
          });
        } else if (!skipSchedule) {
          if (scheduler.type === "delay") {
            // first check is prev has run,
            let isShouldUpdate = false;
            let taskRunType: TaskType = "delay";
            let delay: number | undefined = 0;
            const isFirstRun = lastUpdatedAt === 0;
            const prevTaskShouldRunAt = scheduler.prev as number;
            const nextTaskShouldRunAt = scheduler.next as number;
            let currentJobStartTime = lastUpdatedAt + RUN_INTERVAL;
            if (isFirstRun) {
              currentJobStartTime = currentJobRunCreatedAt;
            }
            log.debug(
              `Trigger [${trigger.name}] of [${
                workflow.relativePath
              }] isFirstRun: ${isFirstRun}
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
              taskRunType = "delay";
              delay = nextTaskShouldRunAt - currentJobRunCreatedAt;
            }

            if (isShouldUpdate) {
              log.debug(
                `Trigger [${trigger.name}] of [${workflow.relativePath}] should be update, schedule type: ${taskRunType}, delay: ${delay}`
              );
              tasks.push({
                workflow: workflow,
                trigger: trigger,
                event: event,
                type: taskRunType,
                delay: delay,
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
        } else {
          // not should trigger
          log.debug(
            `The task trigger [${trigger.name}] of [${workflow.relativePath}]  does not need to be trigged`
          );
        }
      }
    }
  } else {
    log.info(
      `Skip event ${event.type}, Actionsflow will do nothing for this event now.`
    );
  }
  return tasks;
};
