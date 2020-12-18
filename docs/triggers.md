---
title: "Triggers"
metaTitle: "Actionsflow Triggers"
---

Every Actionsflow workflow file starts with a trigger, which watches for new data as it comes in or makes a polling API call to check if there are new updates.

# Trigger List

For now, the following triggers are available:

> [Creating a 3rd-party trigger](./creating-triggers.md) is really easy. We'll be very happy and thankful if you can share your trigger with the community!
> Looking for some awesome workflows? You can see [Awesome Actionsflow Workflows](https://github.com/actionsflow/awesome-actionsflow).
> Looking for some awesome actions? You can see [Awesome Actions List](./actions.md).

## Official Triggers

- [Email](./triggers/email.md) - Watch for new emails.
- [API polling](./triggers/poll.md) - Polling JSON API updates.
- [Graphql polling](./triggers/graphql.md) - Polling Graphql API updates.
- [RSS](./triggers/rss.md) - Watch RSS feed updates.
- [Script](./triggers/script.md) - Run Javascript code to get updates.
- [Webhook](./triggers/webhook.md) - Receive webhook notifications.
- [AWS SNS](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-aws_sns) - Any messages published to the SNS topic you create is triggered by this trigger.
- [Google Form](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-google_form) - Get Google Form response updates when someone submits their response.
- [NPM](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-npm) - Any new version of some package in NPM will trigger this trigger.
- [Reddit](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-reddit) - Any updates in Reddit will trigger this trigger.
- [Slack](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-slack) - Triggered when new messages are detected on a specific Slack channel.
- [Telegram Bot](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-telegram_bot) - Watch Telegram Bot updates.
- [Trello](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-trello) - Watch any action updates on Trello.
- [Twitter](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-twitter) - Watch Twitter's timeline updates.
- [Typeform](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-typeform) - Get form response updates when someone submits their response.
- [Weather](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-weather) - Get weather updates.
- [Youtube](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-youtube) - Get Youtube channel or playlist video updates.

## Community Triggers

Want to list your trigger here? You're welcome to [submit a pull request](https://github.com/actionsflow/actionsflow/edit/main/docs/triggers.md)!

> [Creating a 3rd-party trigger](./creating-triggers.md) is really easy. We'll be very happy and thankful if you can share your trigger with the community!
> We're waiting for your contribution 😊

- [rsshub](https://github.com/theowenyoung/actionsflow-trigger-rsshub) - Easily watches [rsshub](https://docs.rsshub.app/social-media.html) routes.

# Trigger Syntax

Learn more about how to define a trigger in [Workflow Syntax for Actionsflow](./workflow.md).

# Explore

- [Awesome Actionsflow Workflows](https://github.com/actionsflow/awesome-actionsflow)
- [Awesome Actions List](./actions.md)
