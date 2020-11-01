import { log, Log, IStartOptions, ICronJob } from "actionsflow-core";
import { start as startServer } from "./server";
import { start as startCron } from "./cron";
let processExistCode = 0;
let cronJob: ICronJob;
export async function stop(): Promise<void> {
  log.info(`\nStopping actionflow...`);
  if (cronJob) {
    cronJob.stop();
  }
  setTimeout(() => {
    // In case that something goes wrong with shutdown we
    // kill after max. 30 seconds no matter what
    process.exit(processExistCode);
  }, 30000);

  process.exit(processExistCode);
}

export async function start(options: IStartOptions): Promise<void> {
  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);
  let logLevel: Log.LogLevelDesc | undefined;
  if (options.logLevel) {
    logLevel = options.logLevel as Log.LogLevelDesc;
  } else if (options.verbose) {
    logLevel = "debug";
  }
  if (logLevel) {
    log.setLevel(logLevel);
  }
  // Wrap that the process does not close but we can still use async
  (async () => {
    try {
      await startServer(options);
      cronJob = startCron(options);
    } catch (error) {
      log.error(`There was an error: ${error.message}`);

      processExistCode = 1;
      stop();
    }
  })();
}
