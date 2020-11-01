import { CronJob } from "cron";
import { log, IStartOptions, ICronJob } from "actionsflow-core";
import runJob from "./run-workflows";
export const start = (options: IStartOptions): ICronJob => {
  log.info("start cron tasks");
  log.debug("start options", options);
  const interval = options.interval || 5;
  const job = new CronJob(
    `*/${interval} * * * *`,
    function (onComplete: () => void): void {
      (async () => {
        await runJob(options);
      })().then(() => {
        onComplete();
      });
    },
    function () {
      log.info("cron complete");
    },
    false,
    undefined,
    { context: "test" },
    true
  );
  job.start();
  return job;
};
