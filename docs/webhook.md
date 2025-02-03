---
title: "Webhook Syntax"
metaTitle: "Webhook Syntax for Actionsflow"
---

Actionsflow offers a general webhook capability for triggers like [telegram_bot](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-telegram_bot), allowing you to receive timely updates from third-party platforms. If a trigger supports webhooks, you can set a webhook URL on the third-party platform, and the trigger will handle your webhook events.

Generally, a webhook URL will look like this:

```bash
https://webhook.actionsflow.workers.dev/<owner>/<repo>/<workflow-file-name>/<trigger-name>?__token=<your-github-personal-token>
```
- <owner>: Your GitHub username or organization name.
- <repo>: The name of your GitHub repository.
- <workflow-file-name>: The name of your workflow file (without the .yml extension).
- <trigger-name>: The name of the trigger in your workflow.
- __token: Your GitHub personal access token with repo scope.

> Note: For self-hosted version, the webhook URL will look like this: `http://localhost:3000/webhook/<workflow-file-name>/<trigger-name>`

> Note: You need to generate personal access tokens with `repo` scope on your [Github settings](https://github.com/settings/tokens) and then replace `<your-github-personal-token>`.

If successful, the response will include status: `200` and body: `{"success": true}`.

# Customizing Responses

You can specify custom responses for your webhooks using the following query parameters:
- __response_code: Sets the HTTP status code of the response.
- __response_content_type: Sets the Content-Type header of the response.
- __response_body: Sets the body of the response.
- Alternatively, for enhanced security, you can use the X-Github-Authorization header instead of the __token query parameter to pass your GitHub personal access token.

The webhook also supports the cross-origin resource sharing (CORS) request.

## Customized HTTP responses

**cURL example:**

```bash
curl --request POST 'https://webhook.actionsflow.workers.dev/actionsflow/webhook2github/webhook/webhook?__token=<your-github-personal-token>&__response_code=200' \
--header 'Content-Type: application/json' \
--data-raw '{
    "key": "value"
}'
```

`https://webhook.actionsflow.workers.dev/<owner>/<repo>/<workflow-file-name>/<trigger-name>` is the fixed prefix for webhook URL. Most triggers will use this as their webhook URL. But if some trigger has more than one webhook path, the webhook URL may have a suffix, like `https://webhook.actionsflow.workers.dev/<owner>/<repo>/<workflow-file-name>/<trigger-name>/webhook1`. You should check that trigger's documentation for the webhook URL to get more information.

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

The webhook feature in Actionsflow is implemented using GitHub's [repository_dispatch](https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#repository_dispatch) event. When a webhook request is received at:

```bash
https://webhook.actionsflow.workers.dev/<owner>/<repo>/<your-path>?__token=<your-github-personal-token>
```

It forwards the request to: `https://api.github.com/repos/<owner>/<repo>/dispatches`

With the following payload:

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

# Testing and Debugging Webhooks

Testing and debugging webhooks are crucial steps in ensuring that your workflows function as intended. Several tools can assist in this process by allowing you to inspect and simulate webhook requests.

## Beeceptor
[Beeceptor](https://beeceptor.com/webhook-integration/) is an easy to set up tool that enables you to create a mock API endpoint to capture and inspect HTTP requests or simulate responses without the need for coding.

Local Tunnel can be used to route external HTTP traffic to your local development environment, ideal for testing self-hosted consumers or APIs. It also supports customizing responses, enabling you to simulate various scenarios and test how your application handles different responses. It lets you test self-hosted consumers (e.g., webhook handlers, API clients) by forwarding live production traffic to your local machine. This avoids repetitive deployments, letting you iterate faster while debugging payloads, headers, or business logic locally.

## ngrok
[ngrok](https://ngrok.com/) is also can also be to expose a local server to the internet securely, making it easy to test webhooks, APIs, or local applications without deploying them.

> Note: Be vigilant when utilizing third-party tools, as they could potentially expose confidential information. Restrict usage to sandbox and test environments.
