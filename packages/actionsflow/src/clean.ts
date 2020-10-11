import "./env";
import del from "del";
import { log } from "actionsflow-core";
import * as Log from "loglevel";
import path from "path";
import { LogLevelDesc } from "loglevel";

export default (options: {
  dest?: string;
  cwd?: string;
  logLevel?: Log.LogLevelDesc;
  verbose?: boolean;
}): Promise<string[] | void> => {
  options = {
    dest: "./dist",
    cwd: process.cwd(),
    ...options,
  };
  let logLevel: LogLevelDesc | undefined;
  if (options.logLevel) {
    logLevel = options.logLevel as LogLevelDesc;
  } else if (options.verbose) {
    logLevel = "debug";
  }
  if (logLevel) {
    log.setLevel(logLevel);
  }
  return del([
    path.resolve(options.cwd as string, options.dest as string),
    path.resolve(process.cwd(), ".cache"),
  ]).then(() => {
    log.info("Successfully deleted directories");
  });
};
