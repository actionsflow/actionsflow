# `@actionsflow/trigger-telegram_bot`

This is a [telegram bot](https://core.telegram.org/bots/api) trigger of [Actionsflow](https://github.com/actionsflow/actionsflow). `telegram_bot` trigger is triggered when new messages of telegram bot are detected. This trigger supports to specify one message type or multiple message types

> This is an official trigger, you don't need to install it manually.

[View trigger on Github](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-telegram_bot)

# Usage

```yaml
# single message type
on:
  telegram_bot:
    event: text
    token: ${{ secrets.TELEGRAM_BOT_TOKEN }}

# multiple message types
on:
  telegram_bot:
    event:
      - photo
      - text
    token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
```

## Options

- `token`, optional, if `webhook` is `false`, then `token` is required. Telegram bot token, you should get it from [Telegram BotFather](https://telegram.me/BotFather), for example: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`

- `webhook`, optional, `boolean`, if use [telegram webhook mode](https://core.telegram.org/bots/api#setwebhook) to get telegram message updates, the default value is `false`, the trigger will poll to get telegram updates. , if `true`, you must set webhook through telegram's [`setWebhook` API](https://core.telegram.org/bots/api#setwebhook), the webhook URL should be `https://webhook.actionsflow.workers.dev/<owner>/<repo>/<workflow-file-name>/telegram_bot?__token=<your-github-personal-token>`, learn more about webhook URL, see [here](https://actionsflow.github.io/docs/webhook/), here is a CURL example to set webhook:

  ```bash
  curl --request POST 'https://api.telegram.org/bot123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11/setWebhook' \
  --header 'Content-Type: application/json' \
  --data-raw '{
      "url": "https://webhook.actionsflow.workers.dev/<owner>/<repo>/<workflow-file-name>/telegram_bot?__token=<your-github-personal-token>"
  }'
  ```

- `event`, optional, `string` or `string[]`, telegram message type, allowed types:

  - `text`
  - `animation`
  - `audio`
  - `channel_chat_created`
  - `contact`
  - `delete_chat_photo`
  - `dice`
  - `document`
  - `game`
  - `group_chat_created`
  - `invoice`
  - `left_chat_member`
  - `location`
  - `migrate_from_chat_id`
  - `migrate_to_chat_id`
  - `new_chat_members`
  - `new_chat_photo`
  - `new_chat_title`
  - `passport_data`
  - `photo`
  - `pinned_message`
  - `poll`
  - `sticker`
  - `successful_payment`
  - `supergroup_chat_created`
  - `video`
  - `video_note`
  - `voice`

  if `event` is not provided, all message will be triggered. example: `["text","photo"]`,`text`

  > You can use [General Config for Actionsflow Trigger](https://actionsflow.github.io/docs/workflow/#ontriggerconfig) for more customization.

## Outputs

This trigger's outputs will be the item of the telegram message, you can see it [here](https://core.telegram.org/bots/api#message)

An outputs example:

```json
{
  "message_id": 7,
  "from": {
    "id": 1056059698,
    "is_bot": false,
    "first_name": "Owen",
    "last_name": "Young",
    "language_code": "en"
  },
  "chat": {
    "id": 1056059698,
    "first_name": "Owen",
    "last_name": "Young",
    "type": "private"
  },
  "date": 1598383043,
  "text": "test",
  "update_id": 791185172
}
```

You can use the outputs like this:

```yaml
on:
  telegram_bot:
    token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
jobs:
  print:
    name: Print
    runs-on: ubuntu-latest
    steps:
      - name: Print Outputs
        env:
          telegram_text: ${{ on.telegram_bot.outputs.text }}
        run: |
          echo telegram text: $telegram_text
```
