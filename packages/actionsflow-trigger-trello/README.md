# `@actionsflow/trigger-trello`

This is a [trello](https://trello.com/) trigger of [Actionsflow](https://github.com/actionsflow/actionsflow). Any new action in Trello will trigger the trigger.

> This is an official trigger, you don't need to install it manually.

[View trigger on Github](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-trello)

## Prerequisites

You should [Create a webhook at trello with API](https://developer.atlassian.com/cloud/trello/rest/api-group-webhooks/#api-webhooks-post), and set `https://webhook.actionsflow.workers.dev/<owner>/<repo>/<workflow-file-name>/trello?__token=<your-github-personal-token>` as your endpoint, a CURL example:

```bash
curl --request POST \
  --data-urlencode "callbackURL=https://webhook.actionsflow.workers.dev/<owner>/<repo>/<workflow-file-name>/trello?__token=<your-github-personal-token>" \
  --url 'https://api.trello.com/1/webhooks/?key=0471642aefef5fa1fa76530ce1ba4c85&token=9eb76d9a9d02b8dd40c2f3e5df18556c831d4d1fadbe2c45f8310e6c93b5c548&idModel=5abbe4b7ddc1b351ef961414' \
  --header 'Accept: application/json'
```

> You can the trello key at [here](https://trello.com/app-key), and generate a token for you.

> You can get `idModel` by `curl https://api.trello.com/1/members/me/boards?key={yourKey}&token={yourToken}`

## Usage

```yaml
on:
  trello:
```

## Options

There is nothing can be specified. You can use [General Config for Actionsflow Trigger](https://actionsflow.github.io/docs/workflow/#ontriggerconfig) for more customization.

## Outputs

This trigger's outputs will be the body of the aws sns message body, you can see it [here](https://docs.aws.amazon.com/sns/latest/dg/sns-message-and-json-formats.html#http-notification-json)

An outputs example:

```json
{
  "model": {
    "id": "5f4fbbc5250c34138444068d",
    "name": "ideas",
    "desc": "",
    "descData": null,
    "closed": false,
    "idOrganization": null,
    "idEnterprise": null,
    "pinned": false,
    "url": "https://trello.com/b/iCZf1Oev/ideas",
    "shortUrl": "https://trello.com/b/iCZf1Oev",
    "prefs": {
      "permissionLevel": "private",
      "hideVotes": false,
      "voting": "disabled",
      "comments": "members",
      "invitations": "members",
      "selfJoin": true,
      "cardCovers": true,
      "isTemplate": false,
      "cardAging": "regular",
      "calendarFeedEnabled": false,
      "background": "lime",
      "backgroundImage": null,
      "backgroundImageScaled": null,
      "backgroundTile": false,
      "backgroundBrightness": "dark",
      "backgroundColor": "#4BBF6B",
      "backgroundBottomColor": "#4BBF6B",
      "backgroundTopColor": "#4BBF6B",
      "canBePublic": true,
      "canBeEnterprise": true,
      "canBeOrg": true,
      "canBePrivate": true,
      "canInvite": true
    },
    "labelNames": {
      "green": "",
      "yellow": "",
      "orange": "",
      "red": "",
      "purple": "",
      "blue": "",
      "sky": "",
      "lime": "",
      "pink": "",
      "black": ""
    }
  },
  "action": {
    "id": "5f7073311f0aab7e1c3dd44c",
    "idMemberCreator": "5f4fbba99b140e21cceebdb1",
    "data": {
      "card": {
        "id": "5f7073311f0aab7e1c3dd44b",
        "name": "test item",
        "idShort": 2,
        "shortLink": "Iy3XGStt"
      },
      "list": { "id": "5f70732bb7991045f878901e", "name": "todos" },
      "board": {
        "id": "5f4fbbc5250c34138444068d",
        "name": "ideas",
        "shortLink": "iCZf1Oev"
      }
    },
    "type": "createCard",
    "date": "2020-09-27T11:10:41.983Z",
    "limits": {},
    "appCreator": null,
    "display": {
      "translationKey": "action_create_card",
      "entities": {
        "card": {
          "type": "card",
          "id": "5f7073311f0aab7e1c3dd44b",
          "shortLink": "Iy3XGStt",
          "text": "test item"
        },
        "list": {
          "type": "list",
          "id": "5f70732bb7991045f878901e",
          "text": "todos"
        },
        "memberCreator": {
          "type": "member",
          "id": "5f4fbba99b140e21cceebdb1",
          "username": "theowenyoung",
          "text": "Owen Young"
        }
      }
    },
    "memberCreator": {
      "id": "5f4fbba99b140e21cceebdb1",
      "username": "theowenyoung",
      "activityBlocked": false,
      "avatarHash": "6f3911adf8ac1a7d23b57329dd2412dc",
      "avatarUrl": "https://trello-members.s3.amazonaws.com/5f4fbba99b140e21cceebdb1/6f3911adf8ac1a7d23b57329dd2412dc",
      "fullName": "Owen Young",
      "idMemberReferrer": null,
      "initials": "OY",
      "nonPublic": {},
      "nonPublicAvailable": true
    }
  }
}
```

You can use the outputs like this:

```yaml
on:
  trello:
jobs:
  print:
    name: Print
    runs-on: ubuntu-latest
    steps:
      - name: Print Outputs
        env:
          outputs: ${{ toJSON(on.trello.outputs)}}
        run: |
          echo outputs: $outputs
```
