import path from "path";
import aws_sns from "../index";
import {
  getTriggerHelpers,
  getContext,
  getWorkflow,
  formatRequest,
} from "actionsflow-core";
import { IWorkflow } from "actionsflow-core";

test("aws_sns with webhook", async () => {
  const aws_snsBot = new aws_sns({
    options: {
      webhook: true,
    },
    helpers: getTriggerHelpers({
      name: "aws_sns",
      workflowRelativePath: "workflow.yml",
    }),
    workflow: (await getWorkflow({
      path: path.resolve(__dirname, "fixtures/workflows/workflow.yml"),
      cwd: path.resolve(__dirname, "fixtures"),
      context: getContext(),
    })) as IWorkflow,
  });
  const requestPayload = formatRequest({
    path: "/",
    body: {
      Type: "SubscriptionConfirmation",
      MessageId: "165545c9-2a5c-472c-8df2-7ff2be2b3b1b",
      Token: "2336412f37...",
      TopicArn: "arn:aws:sns:us-west-2:123456789012:MyTopic",
      Message:
        "You have chosen to subscribe to the topic arn:aws:sns:us-west-2:123456789012:MyTopic.\nTo confirm the subscription, visit the SubscribeURL included in this message.",
      SubscribeURL:
        "https://sns.us-west-2.amazonaws.com/?Action=ConfirmSubscription&TopicArn=arn:aws:sns:us-west-2:123456789012:MyTopic&Token=2336412f37...",
      Timestamp: "2012-04-26T20:45:04.751Z",
      SignatureVersion: "1",
      Signature:
        "EXAMPLEpH+DcEwjAPg8O9mY8dReBSwksfg2S7WKQcikcNKWLQjwu6A4VbeS0QHVCkhRS7fUQvi2egU3N858fiTDN6bkkOxYDVrY0Ad8L10Hs3zH81mtnPk5uvvolIC1CXGu43obcgFxeL3khZl8IKvO61GWB6jI9b5+gLPoBc1Q=",
      SigningCertURL:
        "https://sns.us-west-2.amazonaws.com/SimpleNotificationService-f3ecfb7224c7233fe7bb5f59f96de52f.pem",
    },
    method: "POST",
    headers: {},
  });
  const request = {
    ...requestPayload,
    params: {},
  };
  const triggerResults = await aws_snsBot.webhooks[0].handler.bind(aws_snsBot)(
    request
  );

  expect(triggerResults.length).toBe(1);
  expect(triggerResults[0].Message).toBe(
    "You have chosen to subscribe to the topic arn:aws:sns:us-west-2:123456789012:MyTopic.\nTo confirm the subscription, visit the SubscribeURL included in this message."
  );
});
