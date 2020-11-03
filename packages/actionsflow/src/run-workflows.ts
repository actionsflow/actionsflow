import { log, IStartOptions } from "actionsflow-core";
import build from "./build";
import { run as runAct } from "./act";
import del from "del";
import path from "path";
export default async function runWorkflows(
  options: IStartOptions
): Promise<void> {
  const date = new Date();
  const timestamp = date.getTime();
  const defaultDest = path.resolve(`./dist/.cron/${timestamp}`);
  if (!options.dest) {
    options.dest = defaultDest;
  }
  log.debug(`start to build Actionsflow workflows, ${date}`);
  await build(options);
  log.debug(`end to build Actionsflow workflows`);

  log.debug(`start to run act, ${new Date()}`);
  const actParams: { src: string; argv: string[] } = {
    src: options.dest,
    argv: [],
  };
  if (options._) {
    actParams.argv = options._.slice(1) as string[];
  }
  await runAct(actParams);
  log.debug(`end to run act, ${new Date()}`);
  log.debug(`start to delete built workflows, ${new Date()}`);
  await del([options.dest]);
  log.debug(`end to delete built workflows, ${new Date()}`);
}
