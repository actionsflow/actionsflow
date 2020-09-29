# `@actionsflow/trigger-aws_sns`

This is an [aws sns](https://aws.amazon.com/sns/) trigger of [Actionsflow](https://github.com/actionsflow/actionsflow). Any messages published to the SNS topic you created are triggered by this trigger.

> This is an official trigger, you don't need to install it manually.

[View trigger on Github](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-aws_sns)

## Prerequisites

You should [Create HTTPS subscription for some Topic at AWS console](https://console.aws.amazon.com/sns/v3/home?#/create-subscription), and set `https://webhook.actionsflow.workers.dev/<owner>/<repo>/<workflow-file-name>/aws_sns?__token=<your-github-personal-token>` as your endpoint

## Usage

```yaml
on:
  aws_sns:
```

## Options

There is nothing can be specified. You can use [General Config for Actionsflow Trigger](https://actionsflow.github.io/docs/workflow/#ontriggerconfig) for more customization.

## Outputs

This trigger's outputs will be the body of the aws sns message body, you can see it [here](https://docs.aws.amazon.com/sns/latest/dg/sns-message-and-json-formats.html#http-notification-json)

An outputs example:

```json
{
  "Type": "SubscriptionConfirmation",
  "MessageId": "165545c9-2a5c-472c-8df2-7ff2be2b3b1b",
  "Token": "2336412f37...",
  "TopicArn": "arn:aws:sns:us-west-2:123456789012:MyTopic",
  "Message": "You have chosen to subscribe to the topic arn:aws:sns:us-west-2:123456789012:MyTopic.\nTo confirm the subscription, visit the SubscribeURL included in this message.",
  "SubscribeURL": "https://sns.us-west-2.amazonaws.com/?Action=ConfirmSubscription&TopicArn=arn:aws:sns:us-west-2:123456789012:MyTopic&Token=2336412f37...",
  "Timestamp": "2012-04-26T20:45:04.751Z",
  "SignatureVersion": "1",
  "Signature": "EXAMPLEpH+DcEwjAPg8O9mY8dReBSwksfg2S7WKQcikcNKWLQjwu6A4VbeS0QHVCkhRS7fUQvi2egU3N858fiTDN6bkkOxYDVrY0Ad8L10Hs3zH81mtnPk5uvvolIC1CXGu43obcgFxeL3khZl8IKvO61GWB6jI9b5+gLPoBc1Q=",
  "SigningCertURL": "https://sns.us-west-2.amazonaws.com/SimpleNotificationService-f3ecfb7224c7233fe7bb5f59f96de52f.pem"
}
```

You can use the outputs like this:

```yaml
on:
  aws_sns:
jobs:
  print:
    name: Print
    runs-on: ubuntu-latest
    steps:
      - name: Print Outputs
        env:
          Message: ${{ on.aws_sns.outputs.Message }}
        run: |
          echo Message: $Message
```
