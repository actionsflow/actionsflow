import path from "path";
import {
  ITriggerContructorParams,
  ITriggerOptions,
  getTriggerConstructorParams as getTriggerConstructorParamsFn,
} from "actionsflow-core";

export const CONTEXT = {
  github: {
    event_name: "repository_dispatch",
    event: {
      action: "test",
      client_payload: {
        test: 1,
      },
    },
  },
  secrets: {},
};
export const getTriggerConstructorParams = async ({
  options,
  name,
}: {
  options: ITriggerOptions;
  name: string;
}): Promise<ITriggerContructorParams> => {
  return getTriggerConstructorParamsFn({
    name: name,
    options,
    cwd: path.resolve(__dirname, "./fixtures"),
    workflowPath: path.resolve(__dirname, "./fixtures/workflows/rss.yml"),
  });
};
