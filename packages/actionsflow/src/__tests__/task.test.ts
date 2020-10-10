import { getTasksByTriggerEvent } from "../task";
import {
  formatRequest,
  getWorkflow,
  getContext,
  IWorkflow,
} from "actionsflow-core";
import path from "path";

test("get task by trigger event manual", async () => {
  const tasks = await getTasksByTriggerEvent({
    event: {
      type: "push",
    },
    workflows: [
      (await getWorkflow({
        path: path.resolve(__dirname, "./fixtures/workflows/rss.yml"),
        cwd: path.resolve(__dirname, "./fixtures"),
        context: getContext(),
      })) as IWorkflow,
    ],
  });
  expect(tasks[0].trigger.name).toEqual("rss");
});

test("get task by trigger event webhook", async () => {
  const tasks = await getTasksByTriggerEvent({
    event: {
      type: "webhook",
      request: formatRequest({
        path: "/webhook/webhook",
        method: "post",
      }),
    },
    workflows: [
      (await getWorkflow({
        path: path.resolve(__dirname, "./fixtures/workflows/webhook.yml"),
        cwd: path.resolve(__dirname, "./fixtures"),
        context: getContext(),
      })) as IWorkflow,
    ],
  });
  expect(tasks.length).toBe(1);
  expect(tasks[0].type).toBe("immediate");
  expect(tasks[0].trigger.name).toEqual("webhook");
});

test("get task by trigger event schedule", async () => {
  const tasks = await getTasksByTriggerEvent({
    event: {
      type: "schedule",
    },
    workflows: [
      (await getWorkflow({
        path: path.resolve(__dirname, "./fixtures/workflows/rss.yml"),
        cwd: path.resolve(__dirname, "./fixtures"),
        context: getContext(),
      })) as IWorkflow,
    ],
  });
  expect(tasks[0].trigger.name).toEqual("rss");
});

test("get task by trigger event schedule, should not update", async () => {
  const currentDate = new Date("2020-10-05T04:13:00.000Z");
  process.env.ACTIONSFLOW_CURRENT_TIME_FOR_CRON = `${currentDate.toISOString()}`;
  process.env.ACTIONSFLOW_CURRENT_RUN_CREATED_AT = `${currentDate.getTime()}`;
  process.env.ACTIONSFLOW_LAST_UPDATE_AT = `${
    currentDate.getTime() - 8 * 60 * 1000
  }`;
  const tasks = await getTasksByTriggerEvent({
    event: {
      type: "schedule",
    },
    workflows: [
      (await getWorkflow({
        path: path.resolve(__dirname, "./fixtures/task/workflows/schedule.yml"),
        cwd: path.resolve(__dirname, "./fixtures/task"),
        context: getContext(),
      })) as IWorkflow,
    ],
  });
  delete process.env.ACTIONSFLOW_LAST_UPDATE_AT;
  delete process.env.ACTIONSFLOW_CURRENT_TIME_FOR_CRON;
  delete process.env.ACTIONSFLOW_CURRENT_RUN_CREATED_AT;
  expect(tasks.length).toEqual(0);
});

test("get task by trigger event schedule border", async () => {
  const currentDate = new Date("2020-10-05T04:10:00.000Z");
  process.env.ACTIONSFLOW_CURRENT_TIME_FOR_CRON = `${currentDate.toISOString()}`;
  process.env.ACTIONSFLOW_CURRENT_RUN_CREATED_AT = `${currentDate.getTime()}`;
  process.env.ACTIONSFLOW_LAST_UPDATE_AT = `${
    currentDate.getTime() - 21 * 60 * 1000
  }`;
  const tasks = await getTasksByTriggerEvent({
    event: {
      type: "schedule",
    },
    workflows: [
      (await getWorkflow({
        path: path.resolve(__dirname, "./fixtures/task/workflows/schedule.yml"),
        cwd: path.resolve(__dirname, "./fixtures/task"),
        context: getContext(),
      })) as IWorkflow,
    ],
  });
  delete process.env.ACTIONSFLOW_LAST_UPDATE_AT;
  delete process.env.ACTIONSFLOW_CURRENT_TIME_FOR_CRON;
  delete process.env.ACTIONSFLOW_CURRENT_RUN_CREATED_AT;
  expect(tasks[0].type).toEqual("immediate");
});
test("get task by trigger event border range", async () => {
  const currentDate = new Date("2020-10-05T04:10:00.000Z");
  process.env.ACTIONSFLOW_CURRENT_TIME_FOR_CRON = `${currentDate.toISOString()}`;
  process.env.ACTIONSFLOW_CURRENT_RUN_CREATED_AT = `${currentDate.getTime()}`;
  process.env.ACTIONSFLOW_LAST_UPDATE_AT = `${
    currentDate.getTime() - 10 * 60 * 1000
  }`;
  const tasks = await getTasksByTriggerEvent({
    event: {
      type: "schedule",
    },
    workflows: [
      (await getWorkflow({
        path: path.resolve(__dirname, "./fixtures/task/workflows/schedule.yml"),
        cwd: path.resolve(__dirname, "./fixtures/task"),
        context: getContext(),
      })) as IWorkflow,
    ],
  });
  delete process.env.ACTIONSFLOW_LAST_UPDATE_AT;
  delete process.env.ACTIONSFLOW_CURRENT_TIME_FOR_CRON;
  delete process.env.ACTIONSFLOW_CURRENT_RUN_CREATED_AT;
  expect(tasks[0].type).toBe("delay");
  expect(tasks[0].delay).toBe(0);
});

test("get task by trigger event specific time", async () => {
  const currentDate = new Date("2020-10-04T23:00:00.000Z");
  process.env.ACTIONSFLOW_CURRENT_TIME_FOR_CRON = `${currentDate.toISOString()}`;
  process.env.ACTIONSFLOW_CURRENT_RUN_CREATED_AT = `${currentDate.getTime()}`;
  process.env.ACTIONSFLOW_LAST_UPDATE_AT = `${
    currentDate.getTime() - 20 * 60 * 1000
  }`;
  const tasks = await getTasksByTriggerEvent({
    event: {
      type: "schedule",
    },
    workflows: [
      (await getWorkflow({
        path: path.resolve(__dirname, "./fixtures/task/workflows/time.yml"),
        cwd: path.resolve(__dirname, "./fixtures/task"),
        context: getContext(),
      })) as IWorkflow,
    ],
  });
  delete process.env.ACTIONSFLOW_LAST_UPDATE_AT;
  delete process.env.ACTIONSFLOW_CURRENT_TIME_FOR_CRON;
  delete process.env.ACTIONSFLOW_CURRENT_RUN_CREATED_AT;
  expect(tasks[0].type).toBe("delay");
  expect(tasks[0].delay).toBe(0);
});

test("get task by trigger event specific time2", async () => {
  const currentDate = new Date("2020-10-04T23:01:00.000Z");
  process.env.ACTIONSFLOW_CURRENT_TIME_FOR_CRON = `${currentDate.toISOString()}`;
  process.env.ACTIONSFLOW_CURRENT_RUN_CREATED_AT = `${currentDate.getTime()}`;
  // process.env.ACTIONSFLOW_LAST_UPDATE_AT = ;
  const tasks = await getTasksByTriggerEvent({
    event: {
      type: "schedule",
    },
    workflows: [
      (await getWorkflow({
        path: path.resolve(__dirname, "./fixtures/task/workflows/time.yml"),
        cwd: path.resolve(__dirname, "./fixtures/task"),
        context: getContext(),
      })) as IWorkflow,
    ],
  });
  delete process.env.ACTIONSFLOW_LAST_UPDATE_AT;
  delete process.env.ACTIONSFLOW_CURRENT_TIME_FOR_CRON;
  delete process.env.ACTIONSFLOW_CURRENT_RUN_CREATED_AT;
  expect(tasks.length).toBe(0);
});

test("get task by trigger event specific time3", async () => {
  const currentDate = new Date("2020-10-04T23:00:00.000Z");
  process.env.ACTIONSFLOW_CURRENT_TIME_FOR_CRON = `${currentDate.toISOString()}`;
  process.env.ACTIONSFLOW_CURRENT_RUN_CREATED_AT = `${currentDate.getTime()}`;
  // process.env.ACTIONSFLOW_LAST_UPDATE_AT = ;
  const tasks = await getTasksByTriggerEvent({
    event: {
      type: "schedule",
    },
    workflows: [
      (await getWorkflow({
        path: path.resolve(__dirname, "./fixtures/task/workflows/time.yml"),
        cwd: path.resolve(__dirname, "./fixtures/task"),
        context: getContext(),
      })) as IWorkflow,
    ],
  });
  delete process.env.ACTIONSFLOW_LAST_UPDATE_AT;
  delete process.env.ACTIONSFLOW_CURRENT_TIME_FOR_CRON;
  delete process.env.ACTIONSFLOW_CURRENT_RUN_CREATED_AT;
  expect(tasks[0].type).toBe("delay");
  expect(tasks[0].delay).toBe(0);
});

test("get task by trigger event specific time but manual run", async () => {
  const currentDate = new Date("2020-10-04T23:00:00.000Z");
  process.env.ACTIONSFLOW_CURRENT_TIME_FOR_CRON = `${currentDate.toISOString()}`;
  process.env.ACTIONSFLOW_CURRENT_RUN_CREATED_AT = `${currentDate.getTime()}`;
  process.env.ACTIONSFLOW_LAST_UPDATE_AT = `${
    currentDate.getTime() - 20 * 60 * 1000
  }`;
  const tasks = await getTasksByTriggerEvent({
    event: {
      type: "push",
    },
    workflows: [
      (await getWorkflow({
        path: path.resolve(__dirname, "./fixtures/task/workflows/time.yml"),
        cwd: path.resolve(__dirname, "./fixtures/task"),
        context: getContext(),
      })) as IWorkflow,
    ],
  });
  delete process.env.ACTIONSFLOW_LAST_UPDATE_AT;
  delete process.env.ACTIONSFLOW_CURRENT_TIME_FOR_CRON;
  delete process.env.ACTIONSFLOW_CURRENT_RUN_CREATED_AT;
  expect(tasks[0].type).toBe("delay");
  expect(tasks[0].delay).toBe(0);
});
test("get task by trigger event push", async () => {
  const currentDate = new Date("2020-10-05T00:08:00.000Z");

  process.env.ACTIONSFLOW_CURRENT_TIME_FOR_CRON = `${currentDate.toISOString()}`;
  process.env.ACTIONSFLOW_CURRENT_RUN_CREATED_AT = `${currentDate.getTime()}`;
  const tasks = await getTasksByTriggerEvent({
    event: {
      type: "push",
    },
    workflows: [
      (await getWorkflow({
        path: path.resolve(__dirname, "./fixtures/task/workflows/push.yml"),
        cwd: path.resolve(__dirname, "./fixtures/task"),
        context: getContext(),
      })) as IWorkflow,
    ],
  });
  expect(tasks.length).toBe(0);
  delete process.env.ACTIONSFLOW_CURRENT_TIME_FOR_CRON;
  delete process.env.ACTIONSFLOW_CURRENT_RUN_CREATED_AT;
});

test("get task by trigger force", async () => {
  const currentDate = new Date("2020-10-05T00:08:00.000Z");

  process.env.ACTIONSFLOW_CURRENT_TIME_FOR_CRON = `${currentDate.toISOString()}`;
  process.env.ACTIONSFLOW_CURRENT_RUN_CREATED_AT = `${currentDate.getTime()}`;
  const tasks = await getTasksByTriggerEvent({
    event: {
      type: "push",
    },
    workflows: [
      (await getWorkflow({
        path: path.resolve(__dirname, "./fixtures/task/workflows/force.yml"),
        cwd: path.resolve(__dirname, "./fixtures/task"),
        context: getContext(),
      })) as IWorkflow,
    ],
  });
  expect(tasks.length).toBe(1);
  delete process.env.ACTIONSFLOW_CURRENT_TIME_FOR_CRON;
  delete process.env.ACTIONSFLOW_CURRENT_RUN_CREATED_AT;
});

test("get task by trigger skipSchedule", async () => {
  const tasks = await getTasksByTriggerEvent({
    event: {
      type: "schedule",
    },
    workflows: [
      (await getWorkflow({
        path: path.resolve(
          __dirname,
          "./fixtures/task/workflows/only-manual.yml"
        ),
        cwd: path.resolve(__dirname, "./fixtures/task"),
        context: getContext(),
      })) as IWorkflow,
    ],
  });
  expect(tasks.length).toBe(0);
});
