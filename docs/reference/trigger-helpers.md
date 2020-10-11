---
title: Trigger Helpers API
metaTitle: Actionsflow Trigger Helpers API
---

Trigger helpers is passed to the [trigger class'](../reference/trigger-api.md) constructor.

The helpers provide commonly used utils in triggers. Here is the trigger helpers' interface:

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
  rssParser: typeof Parser;
}
```

# `createContentDigest`

Create a stable content digest from a string or object, you can use the result of this function to set the unique id.

For example:

```javascript
const id = helpers.createContentDigest({ title: "value" });
```

# `cache`

`Key-value` store used to persist results. All functions are async and return promises. Actionsflow use it to cache the trigger's results deduplication keys and update time.

## Fields

- `get` `(key: string) => Promise<any>`

  Retrieve cached value

  example:

  ```javascript
  const value = await helpers.cache.get(`unique-key`);
  ```

- `set` `(key: string, value: any) => Promise<any>`

  Retrieve cached value

  example:

  ```javascript
  await helpers.cache.set(`unique-key`, value);
  ```

- `del` `(key: string) => Promise<void>`

  delete cached key

  example:

  ```javascript
  await helpers.cache.del(`unique-key`);
  ```

- `reset` `()=> Promise<void>`

  reset the trigger store.

  example:

  ```javascript
  await helpers.cache.reset();
  ```

# `log`

Set of utilities to output information to user.

Actionsflow use [`loglevel`](https://github.com/pimterry/loglevel) for logging.

You can use it like this:

```javascript
helpers.log.info(msg);
helpers.log.trace(msg);
helpers.log.debug(msg);
helpers.log.info(msg);
helpers.log.warn(msg);
helpers.log.error(msg);
```

# `axios`

Make HTTP requests, Actionsflow use [axios](https://github.com/axios/axios) to send requests.

Some third-party triggers have their own libraries on npm which make it easier to create an integration. It can be quite tempting to use them. The problem with those is that you add another dependency and not only one, you add but also all the dependencies of the dependencies. This means more and more code gets added, has to get loaded, can introduce security vulnerabilities, bugs, and so on. So please use the built-in module which can be used like this:

```javascript
const response = await this.helpers.axios(options);
```

See [axios documentation](https://github.com/axios/axios)

# `formatBinary`

Prepare binary data, this helper will transform your binary to base64 string, so user can use it at workflow.

For example:

```javascript
const binaryData = helpers.formatBinary(Buffer.from("test"));
console.log(binaryData.data === "dGVzdA==");
console.log(binaryData.mimeType === "text/plain");
```

# `rssParser`

A small function for turning RSS XML feeds into JavaScript objects. Actionsflow use [`rss-parser`](https://github.com/rbren/rss-parser) to parse a RSS feed.

```javascript
const response = await this.helpers.axios(options);
```

See [RSS Parser documentation](https://github.com/rbren/rss-parser)
