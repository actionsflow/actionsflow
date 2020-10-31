import path from "path";
import { run, resolveTrigger } from "../trigger";
import {
  IWorkflow,
  formatRequest,
  getWorkflow,
  getContext,
  getCache,
  getTriggerId,
  getTriggerConstructorParams,
} from "actionsflow-core";
test("run trigger sortScript", async () => {
  const result = await run({
    trigger: {
      name: "rss",
      options: {
        url: "https://hnrss.org/newest?points=300",
        config: {
          force: true,
          sortScript: `
            return b.id-a.id
          `,
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
      type: "schedule",
    },
  });
  const triggerId = getTriggerId({
    name: "rss",
    workflowRelativePath: "rss.yml",
  });
  const triggerCacheManager = getCache(
    `trigger-cache-manager-rss-${triggerId}`
  );
  expect(result.items.length).toBe(2);
  expect(result.items[0].title).toBe("test2");

  // clear cache
  await triggerCacheManager.reset();
  if (result.helpers && result.helpers.cache) {
    await result.helpers.cache.reset();
  }
});
test("run trigger", async () => {
  const triggerConstructorParams1 = await getTriggerConstructorParams({
    name: "rss",
    cwd: path.resolve(__dirname, "fixtures"),
    workflowPath: path.resolve(__dirname, "fixtures/workflows/test1.yml"),
  });

  expect(triggerConstructorParams1.context.isFirstRun).toBe(true);
  const result = await run({
    trigger: {
      name: "rss",
      options: {
        url: "https://hnrss.org/newest?points=300",
        config: {
          force: true,
          filterScript: `
            if(item.title==='test'){
              return true
            }
          `,
        },
      },
      class: resolveTrigger("rss"),
    },

    workflow: (await getWorkflow({
      path: path.resolve(__dirname, "./fixtures/workflows/test1.yml"),
      cwd: path.resolve(__dirname, "./fixtures"),
      context: getContext(),
    })) as IWorkflow,
    event: {
      type: "schedule",
    },
  });
  const triggerId = getTriggerId({
    name: "rss",
    workflowRelativePath: "test1.yml",
  });
  const triggerCacheManager = getCache(
    `trigger-cache-manager-rss-${triggerId}`
  );
  const firstRunAt = await triggerCacheManager.get("firstRunAt");
  expect(Number(firstRunAt) > 0).toBe(true);
  expect(result.items.length).toBe(1);

  const triggerConstructorParams = await getTriggerConstructorParams({
    name: "rss",
    cwd: path.resolve(__dirname, "fixtures"),
    workflowPath: path.resolve(__dirname, "fixtures/workflows/test1.yml"),
  });

  expect(triggerConstructorParams.context.isFirstRun).toBe(false);
  // clear cache
  await triggerCacheManager.reset();
  if (result.helpers && result.helpers.cache) {
    await result.helpers.cache.reset();
  }
});
test("run trigger with skipFirst", async () => {
  const triggerConstructorParams1 = await getTriggerConstructorParams({
    name: "rss",
    cwd: path.resolve(__dirname, "fixtures"),
    workflowPath: path.resolve(__dirname, "fixtures/workflows/test2.yml"),
    options: {
      config: { skipFirst: true },
    },
  });

  expect(triggerConstructorParams1.context.isFirstRun).toBe(true);
  const result = await run({
    trigger: {
      name: "rss",
      options: {
        url: "https://hnrss.org/newest?points=300",
        config: {
          skipFirst: true,
        },
      },
      class: resolveTrigger("rss"),
    },

    workflow: (await getWorkflow({
      path: path.resolve(__dirname, "./fixtures/workflows/test2.yml"),
      cwd: path.resolve(__dirname, "./fixtures"),
      context: getContext(),
    })) as IWorkflow,
    event: {
      type: "schedule",
    },
  });

  const triggerId = getTriggerId({
    name: "rss",
    workflowRelativePath: "test2.yml",
  });
  const triggerCacheManager = getCache(
    `trigger-cache-manager-rss-${triggerId}`
  );
  const firstRunAt = await triggerCacheManager.get("firstRunAt");
  expect(Number(firstRunAt) > 0).toBe(true);
  expect(result.items.length).toBe(0);

  const triggerConstructorParams = await getTriggerConstructorParams({
    name: "rss",
    cwd: path.resolve(__dirname, "fixtures"),
    workflowPath: path.resolve(__dirname, "fixtures/workflows/test2.yml"),
  });

  expect(triggerConstructorParams.context.isFirstRun).toBe(false);
  // clear cache
  await triggerCacheManager.reset();
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
