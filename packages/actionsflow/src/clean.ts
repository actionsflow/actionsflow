import "./env";
import del from "del";
import { log } from "actionsflow-core";
import * as Log from "loglevel";
import path from "path";
export default (options: {
  dest?: string;
  cwd?: string;
  logLevel?: Log.LogLevelDesc;
}): Promise<string[] | void> => {
  options = {
    dest: "./dist",
    cwd: process.cwd(),
    logLevel: "info",
    ...options,
  };
  return del([
    path.resolve(options.cwd as string, options.dest as string),
    path.resolve(process.cwd(), ".cache"),
  ]).then(() => {
    log.info("Successfully deleted directories");
  });
};
