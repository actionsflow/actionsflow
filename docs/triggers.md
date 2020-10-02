---
title: "Triggers"
metaTitle: "Actionsflow Triggers"
---

Every Actionsflow workflow file starts with a trigger, which watches for new data as it comes in or makes a polling API call to check if there are new updates.

# Trigger List

For now, the following triggers are available:

> [Creating a 3rd-party trigger](./creating-triggers.md) is really easy, we are so happy that you can share your trigger for community.
> Looking for some awesome workflows? You can see [Awesome Actionsflow Workflows](https://github.com/actionsflow/awesome-actionsflow)
> Looking form some awesome actions? You can see [Awesome Actions List](./actions.md)

## Official Triggers

- [Email](./triggers/email.md) - Watch new emails
- [API polling](./triggers/poll.md) - Polling the rest JSON API updates
- [RSS](./triggers/rss.md) - Watch RSS feed updates
- [Script](./triggers/script.md) - Running javascript code to get updates
- [Webhook](./triggers/webhook.md) - Receiving webhook notifications
- [AWS SNS](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-aws_sns) - Any messages published to the SNS topic you created are triggered by this trigger.
- [Google Form](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-google_form) - Get google form response updates when someone submitted
- [NPM](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-npm) - Any new version of some package in NPM will trigger the trigger
- [Reddit](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-reddit) - Any updates in Reddit you will get noticed.
- [Slack](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-slack) - Triggered when new messages of slack channel are detected.
- [Telegram Bot](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-telegram_bot) - Watch Telegram Bot updates
- [Trello](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-trello) - Watch any action updates of trello
- [Twitter](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-twitter) - Watch twitter's timeline updates
- [Typeform](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-typeform) - Get form response updates when someone submitted

## Community Triggers

Want to list your trigger here? Welcome to [submit a pull request](https://github.com/actionsflow/actionsflow/edit/main/docs/triggers.md)

> [Creating a 3rd-party trigger](./creating-triggers.md) is really easy, we are so happy that you can share your trigger for community.

> Waiting for your contribution 😊

- [rsshub](https://github.com/theowenyoung/actionsflow-trigger-rsshub) - Watches [rsshub](https://docs.rsshub.app/social-media.html) routes easily

# Trigger Syntax

For how to define a trigger, see [Workflow Syntax for Actionsflow](./workflow.md)
