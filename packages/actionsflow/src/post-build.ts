export default function postBuild(): void {
  // change ACTIONSFLOW_CURRENT_RUN_CREATED_AT to initial
  if (process.env.OLD_ACTIONSFLOW_CURRENT_RUN_CREATED_AT) {
    process.env.ACTIONSFLOW_CURRENT_RUN_CREATED_AT =
      process.env.OLD_ACTIONSFLOW_CURRENT_RUN_CREATED_AT;
  } else {
    delete process.env.ACTIONSFLOW_CURRENT_RUN_CREATED_AT;
  }

  // change ACTIONSFLOW_CURRENT_RUN_CREATED_AT to initial
  if (process.env.OLD_ACTIONSFLOW_LAST_UPDATE_AT) {
    process.env.ACTIONSFLOW_LAST_UPDATE_AT =
      process.env.OLD_ACTIONSFLOW_LAST_UPDATE_AT;
  } else {
    delete process.env.ACTIONSFLOW_LAST_UPDATE_AT;
  }
}
