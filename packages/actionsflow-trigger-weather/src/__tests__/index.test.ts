import Trigger from "../index";
import { getTriggerConstructorParams, getContext } from "actionsflow-core";
import path from "path";
test("run trigger", async () => {
  const context = getContext();
  const apiKey = context.secrets.OPENWEATHERMAP_API_KEY;
  if (!apiKey) {
    return;
  }

  const trigger = new Trigger(
    await getTriggerConstructorParams({
      name: "weather",
      cwd: path.resolve(__dirname, "fixtures"),
      workflowPath: path.resolve(__dirname, "fixtures/workflows/workflow.yml"),
    })
  );
  const results = await trigger.run();
  expect(results.length).toBe(1);
});
