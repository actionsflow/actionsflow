import path from "path";
import { run, resolveTrigger } from "../trigger";
import {
  IWorkflow,
  formatRequest,
  getWorkflow,
  getContext,
} from "actionsflow-core";
test("run trigger", async () => {
  const result = await run({
    trigger: {
      name: "rss",
      options: {
        url: "https://hnrss.org/newest?points=300",
        config: {
          force: true,
        },
      },
      class: resolveTrigger("rss"),
    },

    workflow: (await getWorkflow({
      path: path.resolve(__dirname, "./fixtures/workflows/rss.yml"),
      cwd: path.resolve(__dirname, "./fixtures"),
      context: getContext(),
    })) as IWorkflow,
    event: {
      type: "manual",
    },
  });

  expect(result.items.length).toBe(2);
  // clear cache
  if (result.helpers && result.helpers.cache) {
    await result.helpers.cache.reset();
  }
});

test("run trigger with github enviroment, use lastUpdateAt", async () => {
  process.env.GITHUB_ACTIONS = "true";
  process.env.ACTIONSFLOW_LAST_UPDATE_AT = `${Date.now()}`;

  const result = await run({
    trigger: {
      name: "rss",
      options: {
        url: "https://hnrss.org/newest?points=300",
        config: {
          every: 5,
        },
      },
      class: resolveTrigger("rss"),
    },

    workflow: (await getWorkflow({
      path: path.resolve(__dirname, "./fixtures/workflows/rss.yml"),
      cwd: path.resolve(__dirname, "./fixtures"),
      context: getContext(),
    })) as IWorkflow,
    event: {
      type: "manual",
    },
  });
  process.env.GITHUB_ACTIONS = "";
  process.env.ACTIONSFLOW_LAST_UPDATE_AT = "";

  expect(result.items.length).toBe(0);
  // clear cache
  if (result.helpers && result.helpers.cache) {
    await result.helpers.cache.reset();
  }
});

test("run trigger with  webhook", async () => {
  const result = await run({
    trigger: {
      name: "webhook",
      options: {
        deduplicationKey: "update_id",
        config: {
          force: true,
        },
      },
      class: resolveTrigger("webhook"),
    },

    workflow: (await getWorkflow({
      path: path.resolve(__dirname, "./fixtures/workflows/webhook.yml"),
      cwd: path.resolve(__dirname, "./fixtures"),
      context: getContext(),
    })) as IWorkflow,
    event: {
      type: "webhook",
      request: formatRequest({
        path: "/webhook/webhook/",
        method: "post",
        body: {
          update_id: "test",
          message: {
            id: "test",
          },
        },
      }),
    },
  });

  expect(result.items.length).toBe(1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((result.items[0] as any).body.message.id).toBe("test");

  // clear cache
  if (result.helpers && result.helpers.cache) {
    await result.helpers.cache.reset();
  }
});

test("run trigger with  special webhook", async () => {
  const result = await run({
    trigger: {
      name: "webhook",
      options: {
        path: "/test",
        method: "post",
        config: {
          force: true,
        },
      },
      class: resolveTrigger("webhook"),
    },

    workflow: (await getWorkflow({
      path: path.resolve(__dirname, "./fixtures/workflows/webhook.yml"),
      cwd: path.resolve(__dirname, "./fixtures"),
      context: getContext(),
    })) as IWorkflow,
    event: {
      type: "webhook",
      request: formatRequest({
        path: "/webhook/webhook/test",
        method: "post",
        body: {
          update_id: "test",
          message: {
            id: "test",
          },
        },
      }),
    },
  });

  expect(result.items.length).toBe(1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((result.items[0] as any).body.message.id).toBe("test");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((result.items[0] as any).method).toBe("post");

  // clear cache
  if (result.helpers && result.helpers.cache) {
    await result.helpers.cache.reset();
  }
});
