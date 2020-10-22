import {
  getWorkflows,
  renameJobsBySuffix,
  getJobsDependences,
  getBuiltWorkflows,
  getWorkflow,
} from "../workflow";
import { getContext } from "../index";
import path from "path";
import { IWorkflow } from "../interface";

test("get workflows", async () => {
  const workflows = await getWorkflows({
    cwd: path.resolve(__dirname, "./fixtures"),
    context: {
      github: {
        event: {},
      },
      secrets: {
        TEST: "test",
      },
    },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((workflows[0] as any).data.on.rss.url).toBe(
    "https://hnrss.org/newest?points=300"
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((workflows[0] as any).data.on.rss.test).toBe("test-1");
});

test("rename jobs by suffix", () => {
  const newJobs = renameJobsBySuffix(
    {
      job1: {},
      job2: {},
    },
    "_0"
  );
  expect(newJobs).toEqual({
    job1_0: {},
    job2_0: {},
  });
});

test("get jobs dependencie", () => {
  const jobsDependences = getJobsDependences({
    job1: {
      needs: ["job2"],
    },
    job2: {},
    job3: {
      needs: ["job1"],
    },
    job4: {},
    job5: {
      needs: ["job4"],
    },
  });
  expect(jobsDependences).toEqual({
    lastJobs: ["job3", "job5"],
    firstJobs: ["job2", "job4"],
  });
});

test("get built workflow", async () => {
  const feedPayload = {
    title: "Can't you just right click?",
    guid: "https://news.ycombinator.com/item?id=24217116",
  };
  const workflowDatas = await getBuiltWorkflows({
    workflow: (await getWorkflow({
      path: path.resolve(__dirname, "./fixtures/workflows/rss.yml"),
      cwd: path.resolve(__dirname, "./fixtures"),
      context: getContext(),
    })) as IWorkflow,
    trigger: {
      name: "rss",
      results: [feedPayload],
      outcome: "success",
      conclusion: "success",
      outputsMode: "separate",
    },
  });
  const workflowData = workflowDatas[0];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((workflowData as any).env.TEST_ENV).toBe("testvalue");
  expect(workflowData.jobs).toHaveProperty("ifttt_0");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((workflowData as any).jobs.ifttt_0.env).toHaveProperty(
    "ACTIONSFLOW_TRIGGER_RESULT_FOR_rss"
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value1 = ((workflowData as any).jobs.ifttt_0.env as Record<
    string,
    string
  >).ACTIONSFLOW_TRIGGER_RESULT_FOR_rss;
  const valueJson = JSON.parse(value1);
  expect(valueJson.outputs.title).toBe("Can't you just right click?");

  expect(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (workflowData as any).jobs.ifttt_0.steps[0].with.value1
  ).toEqual(
    "${{(fromJSON(env.ACTIONSFLOW_TRIGGER_RESULT_FOR_rss)).outputs.title}}"
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((workflowData as any).jobs.ifttt_0.name).toBe(
    "Make a Request to IFTTT 0"
  );
  // const newWorkflow = await readFile(path.resolve(".cache/workflows/"), "utf8");
});

test("get built workflow split", async () => {
  const feedPayload = {
    title: "Can't you just right click?",
    guid: "https://news.ycombinator.com/item?id=24217116",
  };
  const results = Array.from({ length: 11 }).map(() => feedPayload);

  const workflowDatas = await getBuiltWorkflows({
    workflow: (await getWorkflow({
      path: path.resolve(__dirname, "./fixtures/workflows/rss.yml"),
      cwd: path.resolve(__dirname, "./fixtures"),
      context: getContext(),
    })) as IWorkflow,
    trigger: {
      name: "rss",
      results: results,
      outcome: "success",
      conclusion: "success",
      outputsMode: "separate",
      outputsLength: 2,
    },
  });

  expect(workflowDatas.length).toBe(6);
  const workflowData = workflowDatas[0];
  const lastWorkflowData = workflowDatas[5];
  expect(lastWorkflowData.jobs).toHaveProperty("ifttt_10");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((workflowData as any).env.TEST_ENV).toBe("testvalue");
  expect(workflowData.jobs).toHaveProperty("ifttt_0");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((workflowData as any).jobs.ifttt_0.env).toHaveProperty(
    "ACTIONSFLOW_TRIGGER_RESULT_FOR_rss"
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value1 = ((workflowData as any).jobs.ifttt_0.env as Record<
    string,
    string
  >).ACTIONSFLOW_TRIGGER_RESULT_FOR_rss;
  const valueJson = JSON.parse(value1);
  expect(valueJson.outputs.title).toBe("Can't you just right click?");

  expect(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (workflowData as any).jobs.ifttt_0.steps[0].with.value1
  ).toEqual(
    "${{(fromJSON(env.ACTIONSFLOW_TRIGGER_RESULT_FOR_rss)).outputs.title}}"
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((workflowData as any).jobs.ifttt_0.name).toBe(
    "Make a Request to IFTTT 0"
  );
  // const newWorkflow = await readFile(path.resolve(".cache/workflows/"), "utf8");
});

test("get built workflow combine for multiple", async () => {
  const feedPayload = {
    title: "Can't you just right click?",
    guid: "https://news.ycombinator.com/item?id=24217116",
  };
  const results = Array.from({ length: 11 }).map(() => feedPayload);

  const workflowDatas = await getBuiltWorkflows({
    workflow: (await getWorkflow({
      path: path.resolve(
        __dirname,
        "./fixtures/workflows/rss-multiple-trigger-multiple-job.yml"
      ),
      cwd: path.resolve(__dirname, "./fixtures"),
      context: getContext(),
    })) as IWorkflow,
    trigger: {
      name: "rss",
      results: results,
      outcome: "success",
      conclusion: "success",
      outputsMode: "combine",
      outputsLength: 2,
    },
  });

  expect(workflowDatas.length).toBe(6);
  const workflowData = workflowDatas[0];
  const lastWorkflowData = workflowDatas[5];
  expect(lastWorkflowData.jobs).toHaveProperty("print2_5");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect(workflowData.jobs).toHaveProperty("print2_0");

  // const newWorkflow = await readFile(path.resolve(".cache/workflows/"), "utf8");
});
test("get built workflow combine mode", async () => {
  const feedPayload = {
    title: "Can't you just right click?",
    guid: "https://news.ycombinator.com/item?id=24217116",
  };
  const feedPayload2 = {
    title: "Can't you just right click2?",
    guid: "https://news.ycombinator.com/item?id=242171162",
  };
  const workflowDatas = await getBuiltWorkflows({
    workflow: (await getWorkflow({
      path: path.resolve(__dirname, "./fixtures/workflows/rss.yml"),
      cwd: path.resolve(__dirname, "./fixtures"),
      context: getContext(),
    })) as IWorkflow,
    trigger: {
      name: "rss",
      results: [feedPayload, feedPayload2],
      outcome: "success",
      conclusion: "success",
      outputsMode: "combine",
    },
  });
  const workflowData = workflowDatas[0];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((workflowData as any).env.TEST_ENV).toBe("testvalue");
  expect(workflowData.jobs).toHaveProperty("ifttt");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((workflowData as any).jobs.ifttt.env).toHaveProperty(
    "ACTIONSFLOW_TRIGGER_RESULT_FOR_rss"
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value1 = ((workflowData as any).jobs.ifttt.env as Record<
    string,
    string
  >).ACTIONSFLOW_TRIGGER_RESULT_FOR_rss;
  const valueJson = JSON.parse(value1);
  expect(valueJson.outputs.length).toBe(2);
  expect(valueJson.outputs[0].title).toBe(`Can't you just right click?`);

  expect(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (workflowData as any).jobs.ifttt.steps[0].with.value1
  ).toEqual(
    "${{(fromJSON(env.ACTIONSFLOW_TRIGGER_RESULT_FOR_rss)).outputs.title}}"
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((workflowData as any).jobs.ifttt.name).toBe(
    "Make a Request to IFTTT 0"
  );
  // const newWorkflow = await readFile(path.resolve(".cache/workflows/"), "utf8");
});

test("get built workflow combine mode split", async () => {
  const feedPayload = {
    title: "Can't you just right click?",
    guid: "https://news.ycombinator.com/item?id=24217116",
  };
  const results = Array.from({ length: 11 }).map(() => feedPayload);
  const workflowDatas = await getBuiltWorkflows({
    workflow: (await getWorkflow({
      path: path.resolve(__dirname, "./fixtures/workflows/rss.yml"),
      cwd: path.resolve(__dirname, "./fixtures"),
      context: getContext(),
    })) as IWorkflow,
    trigger: {
      name: "rss",
      results: results,
      outcome: "success",
      conclusion: "success",
      outputsMode: "combine",
      outputsLength: 2,
    },
  });
  expect(workflowDatas.length).toBe(6);
  const first = workflowDatas[0];
  const last = workflowDatas[5];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value1 = ((first as any).jobs.ifttt_0.env as Record<string, string>)
    .ACTIONSFLOW_TRIGGER_RESULT_FOR_rss;
  const valueJson = JSON.parse(value1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect(valueJson.outputs[0].title).toBe("Can't you just right click?");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value2 = ((last as any).jobs.ifttt_5.env as Record<string, string>)
    .ACTIONSFLOW_TRIGGER_RESULT_FOR_rss;
  const valueJson2 = JSON.parse(value2);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect(valueJson2.outputs[0].title).toBe("Can't you just right click?");
  return;
});
test("get built for multile jobs workflow", async () => {
  const feedPayload = {
    title: "Can't you just right click?",
    guid: "https://news.ycombinator.com/item?id=24217116",
  };
  const workflowDatas = await getBuiltWorkflows({
    workflow: (await getWorkflow({
      path: path.resolve(
        __dirname,
        "./fixtures/workflows/rss-multiple-job.yml"
      ),
      cwd: path.resolve(__dirname, "./fixtures"),
      context: getContext(),
    })) as IWorkflow,
    trigger: {
      name: "rss",
      outcome: "success",
      conclusion: "success",
      results: [feedPayload],
    },
  });
  const workflowData = workflowDatas[0];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((workflowData as any).env.TEST_ENV).toBe("testvalue");
  expect(workflowData.jobs).toHaveProperty("ifttt_0");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((workflowData as any).jobs.ifttt_0.env).toHaveProperty(
    "ACTIONSFLOW_TRIGGER_RESULT_FOR_rss"
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value1 = ((workflowData as any).jobs.ifttt_0.env as Record<
    string,
    string
  >).ACTIONSFLOW_TRIGGER_RESULT_FOR_rss;
  const valueJson = JSON.parse(value1);
  expect(valueJson.outputs.title).toBe("Can't you just right click?");

  expect(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (workflowData as any).jobs.ifttt_0.steps[0].with.value1
  ).toEqual(
    "${{(fromJSON(env.ACTIONSFLOW_TRIGGER_RESULT_FOR_rss)).outputs.title}}"
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((workflowData as any).jobs.ifttt_0.name).toBe(
    "Make a Request to IFTTT 0"
  );

  expect(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (workflowData as any).jobs.ifttt1_0.steps[0].with.value1
  ).toEqual(
    "${{(fromJSON(env.ACTIONSFLOW_TRIGGER_RESULT_FOR_rss)).outputs.title}}"
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((workflowData as any).jobs.ifttt1_0.name).toBe(
    "Make a Request to IFTTT 1"
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value2 = ((workflowData as any).jobs.ifttt1_0.env as Record<
    string,
    string
  >).ACTIONSFLOW_TRIGGER_RESULT_FOR_rss;
  const valueJson2 = JSON.parse(value2);
  expect(valueJson2.outputs.title).toBe("Can't you just right click?");

  // const newWorkflow = await readFile(path.resolve(".cache/workflows/"), "utf8");
});
test("get built for multile jobs workflow combine", async () => {
  const feedPayload = {
    title: "Can't you just right click?",
    guid: "https://news.ycombinator.com/item?id=24217116",
  };
  const feedPayload2 = {
    title: "Can't you just right click2?",
    guid: "https://news.ycombinator.com/item?id=242171162",
  };
  const workflowDatas = await getBuiltWorkflows({
    workflow: (await getWorkflow({
      path: path.resolve(
        __dirname,
        "./fixtures/workflows/rss-multiple-job-for-combine.yml"
      ),
      cwd: path.resolve(__dirname, "./fixtures"),
      context: getContext(),
    })) as IWorkflow,
    trigger: {
      name: "rss",
      outcome: "success",
      conclusion: "success",
      outputsMode: "combine",
      results: [feedPayload, feedPayload2],
    },
  });
  const workflowData = workflowDatas[0];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((workflowData as any).env.TEST_ENV).toBe("testvalue");
  expect(workflowData.jobs).toHaveProperty("ifttt");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((workflowData as any).jobs.ifttt.env).toHaveProperty(
    "ACTIONSFLOW_TRIGGER_RESULT_FOR_rss"
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value1 = ((workflowData as any).jobs.ifttt.env as Record<
    string,
    string
  >).ACTIONSFLOW_TRIGGER_RESULT_FOR_rss;
  const valueJson = JSON.parse(value1);
  expect(valueJson.outputs.length).toBe(2);
  expect(valueJson.outputs[0].title).toBe("Can't you just right click?");

  expect(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (workflowData as any).jobs.ifttt.steps[0].with.value1
  ).toEqual(
    "${{(fromJSON(env.ACTIONSFLOW_TRIGGER_RESULT_FOR_rss)).outputs.0.title}}"
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((workflowData as any).jobs.ifttt.name).toBe(
    "Make a Request to IFTTT 0"
  );

  expect(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (workflowData as any).jobs.ifttt1.steps[0].with.value1
  ).toEqual(
    "${{(fromJSON(env.ACTIONSFLOW_TRIGGER_RESULT_FOR_rss)).outputs[0].title}}"
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((workflowData as any).jobs.ifttt1.name).toBe(
    "Make a Request to IFTTT 1"
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value2 = ((workflowData as any).jobs.ifttt1.env as Record<
    string,
    string
  >).ACTIONSFLOW_TRIGGER_RESULT_FOR_rss;
  const valueJson2 = JSON.parse(value2);
  expect(valueJson2.outputs.length).toBe(2);

  expect(valueJson2.outputs[0].title).toBe("Can't you just right click?");

  // const newWorkflow = await readFile(path.resolve(".cache/workflows/"), "utf8");
});

test("get workflow", async () => {
  const workflow = await getWorkflow({
    cwd: path.resolve(__dirname, "fixtures"),
    path: path.resolve(__dirname, "fixtures", "workflows", "rss.yml"),
    context: {
      github: {
        event: {},
      },
      secrets: {
        TEST: "test333",
      },
    },
  });
  if (workflow) {
    expect(
      (workflow.data.on as Record<string, Record<string, string>>).rss.test
    ).toBe("test333-1");
  }
});

test("get workflow with env", async () => {
  const workflow = await getWorkflow({
    cwd: path.resolve(__dirname, "fixtures"),
    path: path.resolve(__dirname, "fixtures", "workflows", "rss-env.yml"),
    context: {
      github: {
        event: {},
      },
      secrets: {
        TEST: "test333",
      },
    },
  });
  if (workflow) {
    expect(
      (workflow.data.on as Record<string, Record<string, string>>).rss.test2
    ).toBe("test333-env1-3");
  }
});
