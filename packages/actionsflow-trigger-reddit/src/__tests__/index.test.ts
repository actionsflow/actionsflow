import Trigger from "../index";
import { getTriggerConstructorParams } from "actionsflow-core";
import path from "path";
import items from "./fixtures/items.json";
test("run trigger", async () => {
  const triggerConstructorParams = await getTriggerConstructorParams({
    name: "reddit",
    cwd: path.resolve(__dirname, "fixtures"),
    workflowPath: path.resolve(__dirname, "fixtures/workflows/workflow.yml"),
    options: {
      url: "https://reddit.com/r/news/",
    },
  });
  const trigger = new Trigger(triggerConstructorParams);
  const results = await trigger.run();
  expect(results.length).toBe(2);
});

test("format item", async () => {
  const triggerConstructorParams = await getTriggerConstructorParams({
    name: "reddit",
    cwd: path.resolve(__dirname, "fixtures"),
    workflowPath: path.resolve(__dirname, "fixtures/workflows/workflow.yml"),
    options: {
      url: "https://reddit.com/r/news/",
    },
  });
  const trigger = new Trigger(triggerConstructorParams);
  const result = trigger.formatItem(items[0]);
  expect(result.title).toBe("Important Update: 2020 Election");
});
test("request json", async () => {
  const triggerConstructorParams = await getTriggerConstructorParams({
    name: "reddit",
    cwd: path.resolve(__dirname, "fixtures"),
    workflowPath: path.resolve(__dirname, "fixtures/workflows/workflow.yml"),
    options: {
      url: "https://reddit.com/r/news/",
    },
  });
  const trigger = new Trigger(triggerConstructorParams);
  const result = await trigger.requestJSON(["https://www.reddit.com/hot/"]);
  expect(Array.isArray(result)).toBe(true);
  expect(result[0]).toHaveProperty("title");
});
test("request json2", async () => {
  const triggerConstructorParams = await getTriggerConstructorParams({
    name: "reddit",
    cwd: path.resolve(__dirname, "fixtures"),
    workflowPath: path.resolve(__dirname, "fixtures/workflows/workflow.yml"),
    options: {
      url: "https://reddit.com/r/news/?t=week",
    },
  });
  const trigger = new Trigger(triggerConstructorParams);
  const result = await trigger.requestJSON([
    "https://reddit.com/r/news/?t=week",
  ]);
  expect(Array.isArray(result)).toBe(true);
  expect(result[0]).toHaveProperty("title");
});
