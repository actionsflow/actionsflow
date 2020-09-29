# `@actionsflow/trigger-slack`

This is a [slack](https://slack.com/) trigger of [Actionsflow](https://github.com/actionsflow/actionsflow). `slack` trigger is triggered when new messages of slack channel are detected.

> This is an official trigger, you don't need to install it manually.

[View trigger on Github](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-slack)

## Prerequisites

We used [Slack Outgoing Webhook](https://actionsflow.slack.com/apps/A0F7VRG6Q-outgoing-webhooks?next_id=0) to implement this trigger. So, you should add [Outgoing Webhook](https://actionsflow.slack.com/apps/A0F7VRG6Q-outgoing-webhooks?next_id=0) to your Slack workspace, and set `https://webhook.actionsflow.workers.dev/<owner>/<repo>/<workflow-file-name>/slack?__token=<your-github-personal-token>` as your webhook `URL(s)`

> You can configure the Channel or Trigger Word you want to watch at there.

## Usage

```yaml
on:
  slack:
```

## Options

There is nothing can be specified. You can use [General Config for Actionsflow Trigger](https://actionsflow.github.io/docs/workflow/#ontriggerconfig) for more customization.

## Outputs

This trigger's outputs will be the item of the slack message, you can see it [here](https://api.slack.com/legacy/custom-integrations/outgoing-webhooks#legacy-info__post-data)

An outputs example:

```json
{
  "token": "PLX28DPdb2XzXDGc6Xf717Sg",
  "team_id": "T01AGF6RZ0V",
  "team_domain": "actionsflow",
  "service_id": "1359908388851",
  "channel_id": "C01A4RQM3RD",
  "channel_name": "trigger-test",
  "timestamp": "1599951957.000800",
  "user_id": "U01A4RGKEET",
  "user_name": "theowenyoung",
  "text": "test"
}
```

You can use the outputs like this:

```yaml
on:
  slack:
jobs:
  print:
    name: Print
    runs-on: ubuntu-latest
    steps:
      - name: Print Outputs
        env:
          slack_text: ${{ on.slack.outputs.text }}
        run: |
          echo slack text: $slack_text
```
