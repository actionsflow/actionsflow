---
title: "Webhook Syntax"
metaTitle: "Webhook Syntax for Actionsflow"
---

Actionsflow provides a general webhook capability for triggers. If the trigger supports webhooks, you can set a webhook URL on the third-party platform and then the trigger will handle your webhook event.

Generally, a webhook URL will look like this:

```bash
https://webhook.actionsflow.workers.dev/<owner>/<repo>/<workflow-file-name>/<trigger-name>?__token=<your-github-personal-token>
```

> Note: For self-hosted version, the webhook URL will look like this: `http://localhost:3000/webhook/<workflow-file-name>/<trigger-name>`

> Note: You need to generate personal access tokens with `repo` scope on your [Github settings](https://github.com/settings/tokens) and then replace `<your-github-personal-token>`.

If it's successful, you will get a status: `200`, body: `{"success":true}` response.

Of course, you can use search params `__response_code`, `__response_content_type`, `__response_body` to specify a custom response.

You can also use headers `X-Github-Authorization` instead of search params `__token` for more security.

The webhook also supports the cross-origin resource sharing request.

Specify response code:

```bash
curl --request POST 'https://webhook.actionsflow.workers.dev/actionsflow/webhook2github/webhook/webhook?__token=<your-github-personal-token>&__response_code=200' \
--header 'Content-Type: application/json' \
--data-raw '{
    "key": "value"
}'
```

> `https://webhook.actionsflow.workers.dev/<owner>/<repo>/<workflow-file-name>/<trigger-name>` is the fixed prefix for webhook URL. Most triggers will use this as their webhook URL. But if some trigger has more than one webhook path, the webhook URL may have a suffix, like `https://webhook.actionsflow.workers.dev/<owner>/<repo>/<workflow-file-name>/<trigger-name>/webhook1`. You should check that trigger's documentation for the webhook URL to get more information.

# Webhook-enabled Triggers

Here are examples of triggers that support webhooks:

- [Webhook](./triggers/webhook.md) - Receive webhook notifications.
- [AWS SNS](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-aws_sns) - Any messages published to the SNS topic you create is triggered by this trigger.
- [Google Form](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-google_form) - Get Google Form response updates when someone submits their response.
- [Slack](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-slack) - Triggered when new messages are detected on a specific Slack channel.
- [Telegram Bot](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-telegram_bot) - Watch Telegram Bot updates.
- [Trello](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-trello) - Watch any action updates on Trello.
- [Typeform](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-typeform) - Get form response updates when someone submits their response.

# How It Works

We implemented the Webhook feature by using Github's [`repository_dispatch`](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#repository_dispatch) on the [webhook2github project](https://github.com/actionsflow/webhook2github).

This API will forward the following original webhook request:

```bash
https://webhook.actionsflow.workers.dev/<owner>/<repo>/<your-path>?__token=<your-github-personal-token>
```

To `https://api.github.com/repos/<owner>/<repo>/dispatches`, with the body:

```json
{
  "event_type": "webhook",
  "client_payload": {
    "path": "<your-path>",
    "method": "<request.method>",
    "headers": "<request.headers>",
    "body": "<request body>"
  }
}
```

This way, Github actions will be triggered via the `repository_dispatch` event.
