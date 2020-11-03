import { CronJob } from "cron";
import { log, IStartOptions, ICronJob } from "actionsflow-core";
import runWorkflows from "./run-workflows";
export const start = (options: IStartOptions): ICronJob => {
  log.info("Start cron tasks");
  const interval = options.interval || 5;
  const job = new CronJob(
    `*/${interval} * * * *`,
    function (onComplete: () => void): void {
      (async () => {
        await runWorkflows(options);
      })().then(() => {
        onComplete();
      });
    },
    function () {
      // do nothing for now
    },
    false,
    undefined,
    { context: "test" },
    true
  );
  job.start();
  return job;
};
