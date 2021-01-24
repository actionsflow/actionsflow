import Trigger from "../index";
import { getTriggerConstructorParams } from "actionsflow-core";
import path from "path";
test("run trigger with me", async () => {
  if (!process.env.INSTAGRAM_TOKEN) {
    return;
  }
  const triggerConstructorParams = await getTriggerConstructorParams({
    name: "instagram",
    cwd: path.resolve(__dirname, "fixtures"),
    workflowPath: path.resolve(__dirname, "fixtures/workflows/workflow.yml"),
    options: {
      access_token: process.env.INSTAGRAM_TOKEN,
    },
  });
  const trigger = new Trigger(triggerConstructorParams);
  const results = await trigger.run();

  expect(results.length).toBeGreaterThan(0);
});
test("run trigger1", async () => {
  if (!process.env.INSTAGRAM_TOKEN) {
    return;
  }
  const triggerConstructorParams = await getTriggerConstructorParams({
    name: "instagram",
    cwd: path.resolve(__dirname, "fixtures"),
    workflowPath: path.resolve(__dirname, "fixtures/workflows/workflow.yml"),
    options: {
      user_id: "17841432487737681",
      access_token: process.env.INSTAGRAM_TOKEN,
    },
  });
  const trigger = new Trigger(triggerConstructorParams);
  const results = await trigger.run();
  expect(results.length).toBeGreaterThan(0);
});

test("run trigger for multiple user", async () => {
  if (!process.env.INSTAGRAM_TOKEN) {
    return;
  }
  const triggerConstructorParams = await getTriggerConstructorParams({
    name: "instagram",
    cwd: path.resolve(__dirname, "fixtures"),
    workflowPath: path.resolve(__dirname, "fixtures/workflows/workflow.yml"),
    options: {
      user_id: ["17841432487737681", "17841432487737681"],
      access_token: process.env.INSTAGRAM_TOKEN,
    },
  });
  const trigger = new Trigger(triggerConstructorParams);
  const results = await trigger.run();
  expect(results.length).toBeGreaterThan(0);
});
