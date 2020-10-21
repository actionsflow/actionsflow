import path from "path";
import Slack from "../index";
import { getTriggerConstructorParams, formatRequest } from "actionsflow-core";

test("slack with webhook", async () => {
  const triggerConstructorParams = await getTriggerConstructorParams({
    name: "slack",
    cwd: path.resolve(__dirname, "fixtures"),
    workflowPath: path.resolve(__dirname, "fixtures/workflows/workflow.yml"),
    options: {
      webhook: true,
    },
  });
  const slackBot = new Slack(triggerConstructorParams);
  const requestPayload = formatRequest({
    path: "/",
    body: {
      token: "PLX28DPdb2XzXDGc6Xf717Sg",
      team_id: "T01AGF6RZ0V",
      team_domain: "actionsflow",
      service_id: "1359908388851",
      channel_id: "C01A4RQM3RD",
      channel_name: "trigger-test",
      timestamp: "1599951957.000800",
      user_id: "U01A4RGKEET",
      user_name: "theowenyoung",
      text: "test",
    },
    method: "POST",
    headers: {},
  });
  const request = {
    ...requestPayload,
    params: {},
  };
  const triggerResults = await slackBot.webhooks[0].handler.bind(slackBot)(
    request
  );

  expect(triggerResults.length).toBe(1);
  expect(triggerResults[0].text).toBe("test");
});
