import Trigger from "../index";
import { getTriggerHelpers, getWorkflow, getContext } from "actionsflow-core";
import { IWorkflow } from "actionsflow-core";
import path from "path";
test("run trigger", async () => {
  const trigger = new Trigger({
    options: {
      url: "https://reddit.com/r/news/",
    },
    helpers: getTriggerHelpers({
      name: "reddit",
      workflowRelativePath: "workflow.yml",
    }),
    workflow: (await getWorkflow({
      path: path.resolve(__dirname, "fixtures/workflows/workflow.yml"),
      cwd: path.resolve(__dirname, "fixtures"),
      context: getContext(),
    })) as IWorkflow,
  });
  const results = await trigger.run();
  expect(results.length).toBe(2);
});
