import { log, Log, IStartOptions, ICronJob } from "actionsflow-core";
import { start as startServer } from "./server";
import { start as startCron } from "./cron";
import chokidar from "chokidar";
import runWorkflows from "./run-workflows";
import path from "path";
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
  log.debug("start options: ", options);
  // Wrap that the process does not close but we can still use async
  (async () => {
    try {
      await startServer(options);
      cronJob = startCron(options);
    } catch (error) {
      log.error(`There was an error: ${error.message}`);

      processExistCode = 1;
      stop();
      return;
    }
    if (options.watch) {
      // Initialize watcher.
      const cwd = options.cwd || process.cwd();
      const workflowPath = path.resolve(cwd, "workflows");
      const watchPaths = [workflowPath];
      const watcher = chokidar.watch(watchPaths, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true,
        ignoreInitial: true,
        cwd: cwd,
      });
      const onChange = async (filePath: string): Promise<void> => {
        const absolutePath = path.resolve(cwd, filePath);
        const relativePath = path.relative(workflowPath, absolutePath);
        await runWorkflows({
          ...options,
          include: [relativePath],
        });
      };
      watcher
        .on("add", (path) => {
          log.info(`File ${path} has been added`);
          onChange(path).catch((e) => {
            log.error(e);
          });
        })
        .on("change", (path) => {
          log.info(`File ${path} has been changed`);
          onChange(path).catch((e) => {
            log.error(e);
          });
        });
    }
  })();
}
