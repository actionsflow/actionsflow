import { TaskType } from "./interface";
import parser from "cron-parser";
export interface IScheduler {
  type: TaskType;
  next?: number;
  prev?: number;
}
export const getScheduler = ({
  every,
  timeZone,
}: {
  every: number | string | undefined;
  timeZone?: string | undefined;
}): IScheduler => {
  const scheduler: IScheduler = { type: "immediate" };
  if (!every) return scheduler;
  let cronStr = ``;
  if (typeof every === "number") {
    cronStr = `*/${every} * * * *`;
  } else {
    cronStr = every;
  }

  const interval = parser.parseExpression(cronStr, {
    currentDate: process.env.ACTIONSFLOW_CURRENT_TIME_FOR_CRON || new Date(),
    tz: timeZone,
  });
  scheduler.type = "delay";
  scheduler.prev = interval.prev().getTime();
  scheduler.next = interval.next().getTime();
  return scheduler;
};
