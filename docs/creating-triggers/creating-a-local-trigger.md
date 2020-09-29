---
title: Local Trigger
metaTitle: Creating a Local Actionsflow Trigger
---

If a trigger is only relevant to your specific use-case, or if you’re developing a trigger and want a simpler workflow, a locally defined trigger is a convenient way to create and manage your trigger code.

# Project structure for a local trigger

Place the code in the `triggers` folder in the root of your project like this:

```text
/my-actionsflow-workflow
└── /workflows
    └── workflow.yml
└── /triggers
    └── /my_trigger1
        └── index.js
        └── package.json
    └── my_trigger2.js
```

You can use both a single file or a folder of trigger to define your trigger logic. Then use it like this:

```yaml
on:
  my_trigger1:
    param: value
  my_trigger2:
    param: value
```

[View local triggers example on Github](https://github.com/actionsflow/actionsflow/tree/main/examples/actionsflow-workflow-example/triggers)

To get started developing a trigger locally, you can quickly generate one workflow using `git clone https://github.com/actionsflow/actionsflow-workflow-default`, then create `triggers` folder for your local triggers.

# Sample

A simple example of trigger looks like this:

```javascript
module.exports = class Example {
  constructor({ helpers, options }) {
    this.options = options;
    this.helpers = helpers;
  }
  async run() {
    const items = [
      {
        id: "uniqueId",
        title: "hello world title",
      },
      {
        id: "uniqueId2",
        title: "hello world title2",
      },
    ];
    return items;
  }
};
```

You should implement `run` method or declare `webhooks` definition in a trigger at least.

Learn more about trigger API, please see [Trigger API](../reference/trigger-api.md)

Learn more about trigger examples, see:

- [View RSS trigger on Github](https://github.com/actionsflow/actionsflow/blob/main/packages/actionsflow/src/triggers/rss.ts)
- [View Poll trigger on Github](https://github.com/actionsflow/actionsflow/blob/main/packages/actionsflow/src/triggers/poll.ts)
- [View Telegram Bot trigger on Github](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-telegram_bot)
- [View Twitter trigger on Github](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-twitter)

# API

See [Trigger API](../reference/trigger-api.md)

# Test

Once you have finished the trigger code, you can run `npm run build` to test your trigger, the built workflows will be generated at `dist/workflows`
