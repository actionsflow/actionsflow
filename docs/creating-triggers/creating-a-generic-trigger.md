---
title: Generic Trigger
metaTitle: Creating a Generic Actionsflow Trigger
---

A trigger contain a file, usually in the project root, called `package.json` - this file holds various metadata relevant to the project. The `package.json` file is also used to provide information to npm that identifies the project and allows npm to handle the project's dependencies.

An Actionsflow trigger name looks like **`@actionsflow/trigger-*`**, for example: [`@actionsflow/trigger-twitter`](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-twitter), you should name your trigger with **`@actionsflow/trigger-[name]`**.

> if your trigger name is more than one word, snake case format is recommended for a trigger name, because the jobs use trigger's outputs by `on.trigger_name.outputs.param`, if your trigger is named `trigger-name`, then the jobs should use trigger's outputs by `on['trigger-name'].outputs.param`. Snake case is also Github actions naming conventions, like `pull_request`, it's also Actionsflow trigger recommended naming conventions.

> if the trigger name you want to create has been used, Actionsflow also support load the full name of your trigger package. For example, if your trigger is named `twitter_trigger_for_actionsflow`, then your can use `twitter_trigger_for_actionsflow` as your trigger name at `on`

# Initializing your trigger project through trigger starter

We provide two trigger starters, [one for typescript](https://github.com/actionsflow/actionsflow-trigger-example), [one for javascript](https://github.com/actionsflow/actionsflow-trigger-example_for_js), you can start your trigger from any of them.

```bash
git clone git@github.com:actionsflow/actionsflow-trigger-example.git actionsflow-trigger-<your_trigger_name>
cd actionsflow-trigger-<your_trigger_name>
# change the package.json name author, etc...
```

or if you prefer to use javascript:

```bash
git clone git@github.com:actionsflow/actionsflow-trigger-example_for_js.git actionsflow-trigger-<your_trigger_name>
cd actionsflow-trigger-<your_trigger_name>
# change the package.json name author, etc...
```

# Sample

You need export a class that implements [Actionsflow trigger API](../reference/trigger-api.md) for your trigger package, a simple example for trigger looks like this:

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

# Developing trigger locally

You can use [`npm link`](https://docs.npmjs.com/cli/link.html) or [`yarn link`](https://yarnpkg.com/lang/en/docs/cli/link/) to reference a package from another location on your machine.

By running `npm link ../path/to/my-trigger` in the root of your Actionsflow workflow, your computer will create a symlink to your package.

# API

See [Trigger API](../reference/trigger-api.md)

# Test

Once you have finished the trigger code, you can run `npm run build` to test your trigger at your workflow folder, the built workflows will be generated at `dist/workflows`

# Unit Test

We also recommend that you write a test for your trigger, both of [`@actionsflow/trigger-example`](https://github.com/actionsflow/actionsflow-trigger-example), [`@actionsflow/trigger-example_for_js`](https://github.com/actionsflow/actionsflow-trigger-example_for_js) include a basic test file by using [jest](https://jestjs.io/en/).

# Share your trigger with the world

Once you have finished the trigger, you can publish your trigger package to the [npm registry](https://www.npmjs.com/).

> Note, because your trigger package name is a scoped name, like `@actionsflow/trigger-example`, so you should add `--access public` when you publish it first time.
