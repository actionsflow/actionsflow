---
title: Creating Triggers
metaTitle: Creating an Actionsflow Trigger
---

You may be looking to build and perhaps publish a trigger that doesn't exist yet, or you may just be curious to know more about the anatomy of a Actionsflow trigger (file structure, etc).

# Core concepts

- Actionsflow triggers can be created either as an npm package or as a [local trigger](./creating-triggers/creating-a-local-trigger.md).
- Trigger files export a class with a `run` method for getting the initial results.

A typical trigger class looks like this:

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
    ];
    return items;
  }
};
```

# Naming a trigger

An Actionsflow trigger name looks like this: **`@actionsflow/trigger-*`**. For example: [`@actionsflow/trigger-twitter`](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-twitter). After installing this trigger you would be able to use it like this:

```yaml
on:
  twitter:
    event: user_timeline
```

> If your trigger name is more than one word using snake case format is recommended, because the jobs use triggers' outputs by `on.trigger_name.outputs.param`. If your trigger is named `trigger-name`, then the jobs will use triggers' outputs by `on['trigger-name'].outputs.param`. Snake case is also Github actions' naming convention (like in `pull_request`).

# Options style

Follow the Javascript naming convention: we recommend you use camel case as the option field's name style. For example:

```javascript
{
  deduplicationKey: "id";
}
```

> Note: `options.config` is the [General Config for Actionsflow Trigger](./workflow.md#ontriggerconfig), so you should not use `config` as your option name.

# Start building a trigger

This section of the docs includes the following guides:

- [Creating a Generic Trigger](./creating-triggers/creating-a-generic-trigger.md)
- [Creating a Local Trigger](./creating-triggers/creating-a-local-trigger.md)
- [Triggers API](./reference/trigger-api.md)
