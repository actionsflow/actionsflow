import Trigger from "../index";
import { getTriggerConstructorParams } from "actionsflow-core";
import path from "path";
test("run trigger with error", async () => {
  const triggerConstructorParams = await getTriggerConstructorParams({
    name: "twitter",
    cwd: path.resolve(__dirname, "fixtures"),
    workflowPath: path.resolve(__dirname, "fixtures/workflows/workflow.yml"),
  });
  const trigger = new Trigger(triggerConstructorParams);
  await expect(trigger.run()).rejects.toEqual(
    new Error("Twit config must include `consumer_key` when using user auth.")
  );
});

test("run trigger multiple", async () => {
  const auth = {
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_SECRET,
  };

  if (!auth.consumer_key || !auth.consumer_secret) {
    return;
  }
  const triggerConstructorParams = await getTriggerConstructorParams({
    name: "twitter",
    cwd: path.resolve(__dirname, "fixtures"),
    workflowPath: path.resolve(__dirname, "fixtures/workflows/workflow.yml"),
    options: {
      auth,
      params: [
        { count: 2, screen_name: "TheOwenYoung" },
        { count: 3, screen_name: "newsycombinator" },
      ],
    },
  });
  const trigger = new Trigger(triggerConstructorParams);
  const results = await trigger.run();

  await triggerConstructorParams.helpers.cache.reset();
  await expect(results.length).toBe(5);
});

test("run trigger single", async () => {
  const auth = {
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_SECRET,
  };

  if (!auth.consumer_key || !auth.consumer_secret) {
    return;
  }
  const triggerConstructorParams = await getTriggerConstructorParams({
    name: "twitter",
    cwd: path.resolve(__dirname, "fixtures"),
    workflowPath: path.resolve(__dirname, "fixtures/workflows/workflow.yml"),
    options: {
      auth,
      params: { count: 2, screen_name: "TheOwenYoung" },
    },
  });
  const trigger = new Trigger(triggerConstructorParams);
  const results = await trigger.run();
  await triggerConstructorParams.helpers.cache.reset();
  await expect(results.length).toBe(2);
});

test("run trigger fetch all", async () => {
  const auth = {
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_SECRET,
  };
  if (!auth.consumer_key || !auth.consumer_secret) {
    return;
  }
  const triggerConstructorParams = await getTriggerConstructorParams({
    name: "twitter",
    cwd: path.resolve(__dirname, "fixtures"),
    workflowPath: path.resolve(__dirname, "fixtures/workflows/workflow.yml"),

    options: {
      fetchAllResultsAtFirst: true,
      maxCount: 5,
      auth,
      params: { count: 2, screen_name: "TheOwenYoung" },
    },
  });
  const trigger = new Trigger(triggerConstructorParams);
  const results = await trigger.run();
  await triggerConstructorParams.helpers.cache.reset();
  expect(results.length).toBe(5);
});
