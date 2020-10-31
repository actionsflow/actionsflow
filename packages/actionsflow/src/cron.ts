import { CronJob } from "cron";
import { log, IStartCronOptions } from "actionsflow-core";
import build from "./build";
import { run as runAct } from "./act";
export const start = async (options: IStartCronOptions): Promise<void> => {
  log.info("start cron tasks");
  const job = new CronJob(
    "*/5 * * * *",
    async function () {
      await build(options);
      await runAct();
      // clean dist
      log.info("tick done");
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
};
