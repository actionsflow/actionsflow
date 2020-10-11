import { getCurrentTime } from "./utils";
export const getLastUpdatedAt = async (): Promise<number> => {
  // last update at, first find at env
  const lastUpdateAtFromEnv = process.env.ACTIONSFLOW_LAST_UPDATE_AT;
  let lastUpdateAtTimeFromEnv: number | undefined;
  if (lastUpdateAtFromEnv) {
    lastUpdateAtTimeFromEnv = new Date(Number(lastUpdateAtFromEnv)).getTime();
    if (isNaN(lastUpdateAtTimeFromEnv)) {
      lastUpdateAtTimeFromEnv = undefined;
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
    currentRunCreatedAtTimeFromEnv = new Date(
      Number(currentRunCreatedAtFromEnv)
    ).getTime();
    if (isNaN(currentRunCreatedAtTimeFromEnv)) {
      currentRunCreatedAtTimeFromEnv = undefined;
    }
  }
  const currentRunCreatedAt =
    currentRunCreatedAtTimeFromEnv || getCurrentTime();
  return currentRunCreatedAt;
};
