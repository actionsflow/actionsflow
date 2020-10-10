import { TriggerEventType } from "actionsflow-core";
export const isManualEvent = (event: TriggerEventType): boolean => {
  return (
    event === "push" ||
    event === "repository_dispatch" ||
    event === "workflow_dispatch"
  );
};

export const shouldRunMannually = (
  event: TriggerEventType,
  events: TriggerEventType[]
): boolean => {
  return events.includes(event);
};
