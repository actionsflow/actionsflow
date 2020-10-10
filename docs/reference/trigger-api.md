---
title: Trigger API
---

Triggers determines whether a workflow should start running.

Actionsflow call every trigger in a timed loop, or when a webhook event of the trigger comes, Actionsflow will call the trigger's webhook handler. The trigger just need to return it's data, Actionsflow will handle the deduplication, cache, and run workflow.

A trigger should export a class that implements trigger interface, a simple example of trigger looks like this:

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

See the trigger class declaration:

```typescript
interface ITriggerClassType {
  config?: ITriggerGeneralConfigOptions;
  getItemKey?: (item: AnyObject) => string;
  run?(): Promise<ITriggerResult> | ITriggerResult;
  webhooks?: IWebhook[];
}
```

You can look the whole declarations at [here](https://github.com/actionsflow/actionsflow/blob/main/packages/actionsflow-core/src/interface.ts)

# `constructor`

Actionsflow construct your trigger class with the following params:

```typescript
interface ITriggerContructorParams {
  options: ITriggerOptions;
  helpers: IHelpers;
  workflow: IWorkflow;
}
```

- `options` is the trigger options by user defining, the default value is `{}`, it can be the following values:

  ```typescript
  interface ITriggerOptions extends AnyObject {
    config?: ITriggerGeneralConfigOptions;
  }
  ```

  `config` is the [general options for Actionsflow trigger](../workflow.md#ontriggerconfig), `config` are handled by Actionsflow, you can change the default config by change the instance `config` value, learn more about changing the default`config` see [here](#config)

  `config` interface:

  ```typescript
  interface ITriggerGeneralConfigOptions {
    every?: number;
    timeZone?: string;
    shouldDeduplicate?: boolean;
    shouldRunManually?: boolean;
    skipFirst?: boolean;
    force?: boolean;
    logLevel?: LogLevelDesc;
    active?: boolean;
    buildOutputsOnError?: boolean;
    skipOnError?: boolean;
    filter?: AnyObject;
    filterOutputs?: AnyObject;
    format?: string;
    skip?: number;
    limit?: number;
    sort?: AnyObject;
  }
  ```

- `helpers` is a collection of the commonly used utils for trigger, including `cache`, `log`, `axios`, look at the interface declaration:

  ```typescript
  interface IHelpers {
    createContentDigest: (input: unknown) => string;
    cache: {
      get: (key: string) => Promise<unknown>;
      set: (key: string, value: unknown) => Promise<unknown>;
      del: (key: string) => Promise<void>;
      reset: () => Promise<void>;
    };
    log: Logger;
    axios: AxiosStatic;
    formatBinary: (
      content: Buffer,
      filePath?: string,
      mimeType?: string
    ) => Promise<IBinaryData>;
  }
  ```

  Learn more about helpers, see [Trigger Helpers API](../reference/trigger-helpers.md)

- `workflow`, is the current workflow who use the trigger, including `path`: the workflow absolute path, `relativePath`: the workflow relative path, `data`, the [workflow](../workflow.md) data in JSON object.

  ```typescript
  interface IWorkflow {
    path: string;
    relativePath: string;
    data: IWorkflowData;
  }
  ```

# `run`

Actionsflow call the trigger's instance `run` method in a timed loop, the `run` method should return an object which looks like this:

```javascript
[
  {
    id: "uniqueId",
    title: "title",
  },
];
```

By default, Actionsflow will deduplicate your results by using the deduplication key `item.id`, if the item key `id` not exist, then Actionsflow will hash the `item` data to deduplication. If you don't want to deduplicate your data, then your should set the trigger instance property `config` as `{shouldDeduplicate:true}`. You can also set `getItemKey` method to return the item's deduplication key.

> Note: if your trigger only handle [`webhook`](#webhooks) event, you can ignore this method.

# `config`

optional, `ITriggerGeneralConfigOptions`, you can change the default config by provide `config`.

```yaml
interface ITriggerGeneralConfigOptions {
  every?: number;
  timeZone?: string;
  shouldDeduplicate?: boolean;
  shouldRunManually?: boolean;
  skipFirst?: boolean;
  force?: boolean;
  logLevel?: LogLevelDesc;
  active?: boolean;
  buildOutputsOnError?: boolean;
  skipOnError?: boolean;
  filter?: AnyObject;
  filterOutputs?: AnyObject;
  format?: string;
  skip?: number;
  limit?: number;
  sort?: AnyObject;
}
```

Learn more about config field meaning, see [general options for Actionsflow trigger](../workflow.md#ontriggerconfig)

The default value is:

```json
{
  "every": 5,
  "shouldDeduplicate": true,
  "skipFirst": false,
  "force": false,
  "logLevel": "info",
  "active": true,
  "skipOnError": false,
  "buildOutputsOnError": false,
  "timeZone": "UTC",
  "shouldRunManually": true
}
```

You can set one or more config option to change the default value. For example:

```javascript
module.exports = class Example {
  constructor({ helpers, options }) {
    this.options = options;
    this.helpers = helpers;
  }
  config = {
    limit: 15,
  };
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

# `getItemKey`

Optional, a hook `function`, when `config.shouldDeduplicate` is `true`(the default value for `shouldDeduplicate` is `true`), we use `getItemKey` to specify the deduplication key. `getItemKey` receives `item` as input, return a string of deduplication key.

If you don't provide the method, Actionsflow fallback to looking for `id`, `key`, if neither are supplied, Actionsflow will hash the item, and generate a unique key.

# `webhooks`

```javascript
module.exports = class Example {
  webhooks = [
    {
      path: "/",
      method: "post",
      handler: (request) => {
        let items = [request.body];
        return items;
      },
    },
  ];
};
```

`webhooks` define a group of webhook handlers. When a [webhook event](../webhook.md) of the trigger comes, the handler will be called with the webhook request.

> Note: If you don't familiar with Actionsflow webhook URL format, please see [here](../webhook.md)

The following interface is a webhook interface:

```typescript
interface IWebhook {
  path?: string;
  method?: string | string[];
  getItemKey?: (item: AnyObject) => string;
  handler: IWebhookHandler;
}
```

## `webhook.path`

`path` is using to set the webhook path. if `path` provided, then only the webhook URL matched the `path` will call the handler.

If you only handle one webhook path, then you can provide `handler` method only. All webhook event to the trigger will call the `handler`.

Generally, most of triggers only handle one path. But if your trigger need to handle more than one path, you should set different paths to handle the webhook event.

`https://webhook.actionsflow.workers.dev/<owner>/<repo>/<workflow-file-name>/<trigger-name>` is the fixed prefix for webhook URL, so you just need to define the path after the prefix. For example, if you set path as `/webhook`, then, only `https://webhook.actionsflow.workers.dev/<owner>/<repo>/<workflow-file-name>/<trigger-name>/webhook` will call your webhook handler.

You can also use params path to define your path, like `/user/:user_id`, Actionsflow use [path-to-regexp](https://github.com/pillarjs/path-to-regexp) to handle route.

## `webhook.method`

`method` is using to set the webhook method, it can be `string` or `string[]`, if provided, only specific methods will call the handler. the default value is `undefined`, means all methods request will call the handler.

## `webhook.getItemKey`

Like the trigger instance method [`getItemKey`](#getItemKey), you can specify the `getItemKey` for the webhook. If not provided, Actionsflow will fallback to use the instance's `getItemKey`.

## `webhook.handler`

Required, a hook function that be called when the webhook event comes. It receives a `request` as input, which has the following properties:

```typescript
interface IWebhookRequest {
  method: HTTP_METHODS_LOWERCASE;
  headers: Record<string, string>;
  originPath: string;
  path: string;
  query: ParsedUrlQuery;
  querystring: string;
  search: string;
  params: AnyObject;
  body?: string | AnyObject | undefined;
  searchParams: URLSearchParams;
  URL: URL;
}
```

When the webhook payload `body` is a JSON string, `body` will be converted javascript object automatically.

Like [`run`](#run), The handler also should return an array which looks like this:

```javascript
[
  {
    id: "uniqueId",
    title: "title",
  },
];
```

# More Examples

Learn more about trigger examples, see:

- [View RSS trigger on Github](https://github.com/actionsflow/actionsflow/blob/main/packages/actionsflow/src/triggers/rss.ts)
- [View Poll trigger on Github](https://github.com/actionsflow/actionsflow/blob/main/packages/actionsflow/src/triggers/poll.ts)
- [View Telegram Bot trigger on Github](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-telegram_bot)
- [View Twitter trigger on Github](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-twitter)
