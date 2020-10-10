import { log } from "actionsflow-core";
import { getCurrentTime } from "./utils";
export const getLastUpdatedAt = async (): Promise<number> => {
  // last update at, first find at env
  const lastUpdateAtFromEnv = process.env.ACTIONSFLOW_LAST_UPDATE_AT;
  let lastUpdateAtTimeFromEnv: number | undefined;
  if (lastUpdateAtFromEnv) {
    log.debug("last Update At From Env", lastUpdateAtFromEnv);
    lastUpdateAtTimeFromEnv = new Date(Number(lastUpdateAtFromEnv)).getTime();
    if (isNaN(lastUpdateAtTimeFromEnv)) {
      lastUpdateAtTimeFromEnv = undefined;
    } else {
      log.debug("get last update at from env", lastUpdateAtTimeFromEnv);
    }
  }
  const lastUpdatedAt = lastUpdateAtTimeFromEnv || 0;
  return lastUpdatedAt;
};
export const getCurrentJobCreatedAt = (): number => {
  // last update at, first find at env
  const currentRunCreatedAtFromEnv =
    process.env.ACTIONSFLOW_CURRENT_RUN_CREATED_AT;
  let currentRunCreatedAtTimeFromEnv: number | undefined;
  if (currentRunCreatedAtFromEnv) {
    log.debug("last Update At From Env", currentRunCreatedAtFromEnv);
    currentRunCreatedAtTimeFromEnv = new Date(
      Number(currentRunCreatedAtFromEnv)
    ).getTime();
    if (isNaN(currentRunCreatedAtTimeFromEnv)) {
      currentRunCreatedAtTimeFromEnv = undefined;
    } else {
      log.debug("get last update at from env", currentRunCreatedAtTimeFromEnv);
    }
  }
  const currentRunCreatedAt =
    currentRunCreatedAtTimeFromEnv || getCurrentTime();
  return currentRunCreatedAt;
};
