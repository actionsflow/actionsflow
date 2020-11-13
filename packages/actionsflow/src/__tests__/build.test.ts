import build from "../build";
import { readFile } from "fs-extra";
import path from "path";
import yaml from "js-yaml";
function toPosixPath(pathstring: string): string {
  // And heck, you don't even need to put it in a function unless
  // you need this conversion all over the place in your code.
  return pathstring.split(path.sep).join(path.posix.sep);
}
test("build workflows", async () => {
  // set process env
  process.env.JSON_SECRETS =
    '{"GITHUB_TOKEN": "fake_github_token","IFTTT_KEY":"fake_ifttt_key","TELEGRAM_BOT_TOKEN":"fake_telegram_bot_token"}';

  await build({
    force: true,
    cwd: path.resolve(__dirname, "./fixtures"),
  });
  expect(process.env.ACTIONSFLOW_CURRENT_RUN_CREATED_AT).toBe(undefined);
  // read built file
  const yamlString = await readFile(
    path.resolve(__dirname, "./fixtures/dist/workflows/2-rss-rss.yml"),
    "utf8"
  );
  const newWorkflow = yaml.safeLoad(yamlString);
  const redditYamlString = await readFile(
    path.resolve(__dirname, "./fixtures/dist/workflows/0-reddit-reddit.yml"),
    "utf8"
  );
  const newRedditWorkflow = yaml.safeLoad(redditYamlString);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const json = require(path.resolve(
    __dirname,
    "./fixtures/dist/outputs/reddit/reddit.json"
  ));
  expect(Array.isArray(json)).toBe(true);

  const rssExportYamlString = await readFile(
    path.resolve(__dirname, "./fixtures/dist/workflows/1-rss-export-rss.yml"),
    "utf8"
  );
  const rssExportWorkflow = yaml.safeLoad(rssExportYamlString);
  const rssExportsResult0 = JSON.parse(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (rssExportWorkflow as any).jobs.ifttt_0.env
      .ACTIONSFLOW_TRIGGER_RESULT_FOR_rss
  );
  expect(toPosixPath(rssExportsResult0.outputs.path)).toBe(
    "dist/results/rss-export/rss_0.json"
  );
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const rssExportJson = require(path.resolve(
    __dirname,
    "./fixtures",
    rssExportsResult0.outputs.path
  ));
  expect(rssExportJson.title).toBe("test");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((newWorkflow as any).jobs.ifttt_0.steps[0].with.key).toBe(
    "${{ secrets.IFTTT_KEY }}"
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((newWorkflow as any).jobs.ifttt_1.needs[0]).toBe("ifttt_0");
  const newRedditWorkflowResult0 = JSON.parse(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (newRedditWorkflow as any).jobs.print.env
      .ACTIONSFLOW_TRIGGER_RESULT_FOR_reddit
  );
  expect(toPosixPath(newRedditWorkflowResult0.outputs.path)).toBe(
    "dist/outputs/reddit/reddit.json"
  );
});

test("build webhook workflows", async () => {
  // set process env
  process.env.JSON_SECRETS =
    '{"GITHUB_TOKEN": "fake_github_token","IFTTT_KEY":"fake_ifttt_key","TELEGRAM_BOT_TOKEN":"fake_telegram_bot_token"}';
  process.env.JSON_GITHUB = `{
    "event_name":"repository_dispatch",
    "event":{
      "action":"webhook",
      "client_payload":{
        "path":"/webhook/webhook",
        "body":"{\\"id\\":\\"test123\\",\\"title\\":\\"webhook test title\\"}"
      }
    }
  }`;

  await build({
    force: true,
    cwd: path.resolve(__dirname, "./fixtures"),
  });
  // read built file
  const yamlString = await readFile(
    path.resolve(__dirname, "./fixtures/dist/workflows/0-webhook-webhook.yml"),
    "utf8"
  );
  const newWorkflow = yaml.safeLoad(yamlString);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((newWorkflow as any).jobs.ifttt_0.steps[0].with.value2).toBe(
    "${{(fromJSON(env.ACTIONSFLOW_TRIGGER_RESULT_FOR_webhook)).outputs.payload.key}}"
  );
});

test("build webhook workflows with error", async () => {
  // set process env
  process.env.JSON_SECRETS =
    '{"GITHUB_TOKEN": "fake_github_token","IFTTT_KEY":"fake_ifttt_key","TELEGRAM_BOT_TOKEN":"fake_telegram_bot_token"}';
  process.env.JSON_GITHUB = `{
    "event_name":"repository_dispatch",
    "event":{
      "action":"webhook",
      "client_payload":{
        "path":"/webhook-error/webhook",
        "body":"{\\"id\\":\\"test123\\",\\"title\\":\\"webhook test title\\"}"
      }
    }
  }`;

  await expect(
    build({
      force: true,
      cwd: path.resolve(__dirname, "./fixtures"),
    })
  ).rejects.toThrow("Multiple Errors when running triggers");
});
