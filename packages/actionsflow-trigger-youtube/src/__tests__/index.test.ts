import Trigger from "../index";
import { getTriggerConstructorParams } from "actionsflow-core";
import path from "path";
test("run trigger", async () => {
  const triggerConstructorParams = await getTriggerConstructorParams({
    name: "youtube",
    cwd: path.resolve(__dirname, "fixtures"),
    workflowPath: path.resolve(__dirname, "fixtures/workflows/workflow.yml"),
    options: {
      channel_id: "UCnCikd0s4i9KoDtaHPlK-JA",
    },
  });
  const trigger = new Trigger(triggerConstructorParams);
  const results = await trigger.run();

  expect(results.length).toBeGreaterThan(1);
});
