# `@actionsflow/trigger-typeform`

This is a [typeform](https://www.typeform.com/) trigger of [Actionsflow](https://github.com/actionsflow/actionsflow). Any new submission in Typeform will trigger the trigger.

> This is an official trigger, you don't need to install it manually.

[View trigger on Github](https://github.com/actionsflow/actionsflow/tree/master/packages/actionsflow-trigger-typeform)

## Prerequisites

You should [Create a webhook at typeform form connect->webhooks](https://help.typeform.com/hc/en-us/articles/360029573471-Webhooks), and set `https://webhook.actionsflow.workers.dev/<owner>/<repo>/<workflow-file-name>/typeform?__token=<your-github-personal-token>` as your endpoint

## Usage

```yaml
on:
  typeform:
```

## Options

There is nothing can be specified. You can use [General Config for Actionsflow Trigger](https://actionsflow.github.io/docs/workflow/#ontriggerconfig) for more customization.

## Outputs

This trigger's outputs will be the body of the aws sns message body, you can see it [here](https://docs.aws.amazon.com/sns/latest/dg/sns-message-and-json-formats.html#http-notification-json)

An outputs example:

```json
{
  "event_id": "01EK4R5PFZZP6C8H14RTP4YW6C",
  "event_type": "form_response",
  "form_response": {
    "form_id": "g8hcyeXS",
    "token": "x71for1wr6irs2rx71fotn12b3izh25v",
    "landed_at": "2020-09-26T08:23:47Z",
    "submitted_at": "2020-09-26T08:23:49Z",
    "definition": {
      "id": "g8hcyeXS",
      "title": "Feedback",
      "fields": [
        {
          "id": "M8JLOd0nIQPU",
          "title": "What's your name?",
          "type": "short_text",
          "ref": "9a489f17-8765-494b-933e-3624c645bd0c",
          "properties": {}
        }
      ]
    },
    "answers": [
      {
        "type": "text",
        "text": "test1",
        "field": {
          "id": "M8JLOd0nIQPU",
          "type": "short_text",
          "ref": "9a489f17-8765-494b-933e-3624c645bd0c"
        }
      }
    ]
  },
  "answers_map": {
    "What's your name?": "test1"
  }
}
```

You can use the outputs like this:

```yaml
on:
  typeform:
jobs:
  print:
    name: Print
    runs-on: ubuntu-latest
    steps:
      - name: Print Outputs
        env:
          answer: ${{ on.typeform.outputs.answers_map["What's your name?"] }}
        run: |
          echo answer: $answer
```
