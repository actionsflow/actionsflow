import execSh from "exec-sh";
import { log } from "actionsflow-core";
export const run = async (): Promise<void> => {
  execSh(
    "act --workflows ./dist/workflows --secret-file ./dist/.secrets --eventpath ./dist/event.json --env-file ./dist/.env -P ubuntu-latest=actionsflow/act-environment:v1 -P ubuntu-18.04=actionsflow/act-environment:v1",
    {},
    function (err: Error) {
      if (err) {
        log.error("Exit code: ", err);
      }
    }
  );
};
