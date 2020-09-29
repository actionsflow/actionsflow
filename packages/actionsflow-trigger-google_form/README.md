# `@actionsflow/trigger-google_form`

This is a [google_form](https://docs.google.com/forms) trigger of [Actionsflow](https://github.com/actionsflow/actionsflow). Any new response in Google Form will trigger the trigger.

> This is an official trigger, you don't need to install it manually.

[View trigger on Github](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-google_form)

## Prerequisites

You should [Create a custom script at google form More->Script Editor](https://developers.google.com/apps-script/overview)

![Create a custom script at google form](https://i.imgur.com/cxPacA6.png)

1. paste the following script to the editor, change the `WEBHOOK_URL` to yours.

   ```javascript
   var WEBHOOK_URL =
     "https://webhook.actionsflow.workers.dev/<owner>/<repo>/<workflow-file-name>/google_form?__token=<your-github-personal-token>";

   function onFormSubmit(e) {
     var response = e.response;
     var source = e.source;
     var itemResponses = response.getItemResponses();
     var definition = {
       title: source.getTitle(),
       fields: [],
     };
     const formItems = source.getItems();
     for (var i = 0; i < formItems.length; i++) {
       const formItem = formItems[i];
       definition.fields.push({
         id: formItem.getId(),
         title: formItem.getTitle(),
         type: formItem.getType(),
         index: formItem.getIndex(),
       });
     }

     var answers = [];
     for (var j = 0; j < itemResponses.length; j++) {
       var itemResponse = itemResponses[j];
       const formItem = itemResponse.getItem();
       answers.push({
         response: itemResponse.getResponse(),
         field: {
           id: formItem.getId(),
           title: formItem.getTitle(),
           type: formItem.getType(),
           index: formItem.getIndex(),
         },
       });
     }
     var webhookPayload = {
       event_id: response.getId(),
       event_type: "form_response",
       form_response: {
         form_id: source.getId(),
         email: response.getRespondentEmail(),
         submitted_at: response.getTimestamp().toISOString(),
         definition: definition,
         answers: answers,
       },
     };
     var options = {
       method: "post",
       contentType: "application/json",
       payload: JSON.stringify(webhookPayload),
     };
     UrlFetchApp.fetch(WEBHOOK_URL, options);
   }
   ```

1. Add a trigger by selecting Current project's triggers in the Edit menu, and creating a new trigger using the settings given below. Save it.

![Add a trigger](https://i.imgur.com/qzjkRwj.png)

![Add a trigger](https://i.imgur.com/sH7xh6E.png)

## Usage

```yaml
on:
  google_form:
```

## Options

There is nothing can be specified. You can use [General Config for Actionsflow Trigger](https://actionsflow.github.io/docs/workflow/#ontriggerconfig) for more customization.

## Outputs

This trigger's outputs will be the body of the aws sns message body, you can see it [here](https://docs.aws.amazon.com/sns/latest/dg/sns-message-and-json-formats.html#http-notification-json)

An outputs example:

```json
{
  "event_id": "2_ABaOnud0S_zjpIn9oGqBpmY65p_NsuiBSqvdwPlapEig0GM4EPdeStVqalzlAb3AEovoWgA",
  "event_type": "form_response",
  "form_response": {
    "form_id": "118EoaS7eK2qvWv8tQy3xLKa-MGgRAizQvO5PKVArWG4",
    "email": "",
    "submitted_at": "2020-09-27T07:54:30.661Z",
    "definition": {
      "title": "test formt",
      "fields": [
        {
          "id": 440714388,
          "title": "question 1",
          "type": "MULTIPLE_CHOICE",
          "index": 0
        },
        {
          "id": 886865551,
          "title": "name",
          "type": "TEXT",
          "index": 1
        }
      ]
    },
    "answers": [
      {
        "response": "Option 2",
        "field": {
          "id": 440714388,
          "title": "question 1",
          "type": "MULTIPLE_CHOICE",
          "index": 0
        }
      },
      {
        "response": "test",
        "field": {
          "id": 886865551,
          "title": "name",
          "type": "TEXT",
          "index": 1
        }
      }
    ]
  },
  "answers_map": {
    "question 1": "Option 2",
    "name": "test"
  }
}
```

You can use the outputs like this:

```yaml
on:
  google_form:
jobs:
  print:
    name: Print
    runs-on: ubuntu-latest
    steps:
      - name: Print Outputs
        env:
          answer: ${{ toJSON(on.google_form.outputs.answers_map) }}
        run: |
          echo answer: $answer
```
