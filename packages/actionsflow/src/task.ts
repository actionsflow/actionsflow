import {
  getRawTriggers,
  log,
  getParamsByWebhookPath,
  getWorkflowFileNameByPath,
  ITask,
  ITriggerEvent,
  IWorkflow,
  IWebhookRequest,
} from "actionsflow-core";
import { getSupportedTriggers, resolveTrigger } from "./trigger";
export const getTasksByTriggerEvent = ({
  event,
  workflows,
}: {
  event: ITriggerEvent;
  workflows: IWorkflow[];
}): ITask[] => {
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
  } else if (event.type === "schedule" || event.type === "manual") {
    // manual
    for (let i = 0; i < workflows.length; i++) {
      const workflow = workflows[i];
      const rawTriggers = getRawTriggers(workflow.data);
      // get all support and active triggers
      const supportedTriggers = getSupportedTriggers(rawTriggers);
      // manual run trigger
      for (let j = 0; j < supportedTriggers.length; j++) {
        const trigger = supportedTriggers[j];

        // TODO check is trigger should be triggered at the moment

        tasks.push({
          workflow: workflow,
          trigger: trigger,
          event: event,
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
