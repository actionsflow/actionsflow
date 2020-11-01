import { promise as execSh } from "exec-sh";
import { log } from "actionsflow-core";
import path from "path";
interface IRunAct {
  src?: string;
}
export const run = async (options: IRunAct): Promise<void> => {
  const sourceFolder = options.src || "./dist";
  const workflowsPath = path.join(sourceFolder, "workflows");
  const secretsPath = path.join(sourceFolder, ".secrets");
  const eventPath = path.join(sourceFolder, "event.json");
  const envPath = path.join(sourceFolder, ".env");
  const actCommand = `act --workflows ${workflowsPath} --secret-file ${secretsPath} --eventpath ${eventPath} --env-file ${envPath} -P ubuntu-latest=actionsflow/act-environment:v1 -P ubuntu-18.04=actionsflow/act-environment:v1`;
  log.debug("act command: ", actCommand);
  await execSh(actCommand);
};
