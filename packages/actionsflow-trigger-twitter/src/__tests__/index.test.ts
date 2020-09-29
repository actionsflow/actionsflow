import Trigger from "../index";
import { getTriggerHelpers, getWorkflow, getContext } from "actionsflow-core";
import { IWorkflow } from "actionsflow-core";
import path from "path";
test("run trigger", async () => {
  const trigger = new Trigger({
    options: {},
    helpers: getTriggerHelpers({
      name: "twitter",
      workflowRelativePath: "workflow.yml",
    }),
    workflow: (await getWorkflow({
      path: path.resolve(__dirname, "fixtures/workflows/workflow.yml"),
      cwd: path.resolve(__dirname, "fixtures"),
      context: getContext(),
    })) as IWorkflow,
  });
  await expect(trigger.run()).rejects.toEqual(
    new Error("Twit config must include `consumer_key` when using user auth.")
  );
});
