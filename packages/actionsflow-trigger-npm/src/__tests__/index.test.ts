import Trigger from "../index";
import { getTriggerConstructorParams } from "actionsflow-core";
import path from "path";
test("run trigger", async () => {
  const triggerConstructorParams = await getTriggerConstructorParams({
    name: "npm",
    cwd: path.resolve(__dirname, "fixtures"),
    workflowPath: path.resolve(__dirname, "fixtures/workflows/workflow.yml"),
    options: {
      name: "actionsflow",
    },
  });
  const trigger = new Trigger(triggerConstructorParams);
  const results = await trigger.run();
  expect(results.length).toBe(1);
  expect(results[0]).toHaveProperty("version");
});
