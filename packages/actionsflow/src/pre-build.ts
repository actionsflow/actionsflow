import { getCache } from "actionsflow-core";
import { getCurrentTime } from "./utils";

export default async function preBuild(): Promise<void> {
  // export job start time for local, for production, this env should be created by Actionsflow action
  if (process.env.ACTIONSFLOW_CURRENT_RUN_CREATED_AT) {
    process.env.OLD_ACTIONSFLOW_CURRENT_RUN_CREATED_AT =
      process.env.ACTIONSFLOW_CURRENT_RUN_CREATED_AT;
  }

  if (
    process.env.GITHUB_ACTIONS !== "true" &&
    !process.env.ACTIONSFLOW_CURRENT_RUN_CREATED_AT
  ) {
    // inject ACTIONSFLOW_CURRENT_RUN_CREATED_AT for local
    process.env.ACTIONSFLOW_CURRENT_RUN_CREATED_AT = getCurrentTime().toString();
  }

  // export job start time for local, for production, this env should be created by Actionsflow action
  if (process.env.ACTIONSFLOW_LAST_UPDATE_AT) {
    process.env.OLD_ACTIONSFLOW_LAST_UPDATE_AT =
      process.env.ACTIONSFLOW_LAST_UPDATE_AT;
  }

  if (
    process.env.GITHUB_ACTIONS !== "true" &&
    !process.env.ACTIONSFLOW_LAST_UPDATE_AT
  ) {
    // inject ACTIONSFLOW_LAST_UPDATE_AT for local
    const cacheManager = getCache(`actionsflow-system-cache`);
    const lastUpdatedAt = await cacheManager.get("lastUpdatedAt");
    process.env.ACTIONSFLOW_LAST_UPDATE_AT = lastUpdatedAt as string;
    await cacheManager.set("lastUpdatedAt", getCurrentTime().toString());
  }
}
