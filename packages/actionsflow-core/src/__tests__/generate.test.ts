import path from "path";
import { readJson, readFile } from "fs-extra";
import {
  buildNativeEvent,
  buildNativeSecrets,
  buildWorkflowFile,
  buildNativeEnv,
} from "../generate";

test("build native event", async () => {
  await buildNativeEvent({
    dest: path.resolve(".cache"),
    github: {
      event: {
        action: "test",
      },
    },
  });
  const eventJson = await readJson(path.resolve(".cache/event.json"));
  expect(eventJson).toEqual({
    action: "test",
  });
});

test("build secrets", async () => {
  await buildNativeSecrets({
    dest: path.resolve(".cache"),
    secrets: {
      TOKEN: "token",
      TEST: "test",
    },
  });
  const secretsString = await readFile(path.resolve(".cache/.secrets"), "utf8");
  expect(secretsString).toEqual("TOKEN=token\nTEST=test\n");
});

test("build env", async () => {
  process.env.GITHUB_TEST = "test";

  await buildNativeEnv({
    dest: path.resolve(".cache"),
  });
  process.env.GITHUB_TEST = "";
  process.env.ACTIONS_TEST = "";
  process.env.GITHUB_RUN_ID = "";
  const envString = await readFile(path.resolve(".cache/.env"), "utf8");
  expect(envString).toMatch("GITHUB_TEST=test");
});

test("build workflow file", async () => {
  let longText = ``;

  for (let i = 0; i < 500; i++) {
    longText += "long ";
  }
  await buildWorkflowFile({
    dest: path.resolve(".cache", "workflow.yml"),
    workflowData: {
      on: {
        push: null,
      },
      env: {
        test: longText,
      },
    },
  });
  const workflowContent = await readFile(
    path.resolve(".cache/workflow.yml"),
    "utf8"
  );

  expect(workflowContent).toBe(`'on':
  push: null
env:
  test: '${longText}'
`);
});
