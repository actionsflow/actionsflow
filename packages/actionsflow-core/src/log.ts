import chalk from "chalk";
import * as Log from "loglevel";
import prefix from "loglevel-plugin-prefix";
const log = Log.getLogger("actionsflow");
interface IColors {
  [key: string]: chalk.Chalk;
}
export const colors: IColors = {
  TRACE: chalk.magenta,
  DEBUG: chalk.cyan,
  INFO: chalk.green,
  WARN: chalk.yellow,
  ERROR: chalk.red,
};
prefix.reg(Log);

log.setDefaultLevel(
  (process.env.DEFAULT_LOG_LEVEL as Log.LogLevelDesc) || "info"
);

prefix.apply(log, {
  format(level, name, timestamp) {
    return `${chalk.gray(`[${timestamp}]`)} ${colors[level.toUpperCase()](
      level
    )} ${chalk.green(`${name}:`)}`;
  },
});
export { log, Log, prefix };
