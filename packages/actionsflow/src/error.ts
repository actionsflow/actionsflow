import { ITriggerError } from "actionsflow-core";
export class TriggersError extends Error {
  errors: ITriggerError[] = [];
  constructor(errors: ITriggerError[]) {
    super(`Multiple Errors when running triggers`);
    this.errors = errors;
  }
}
