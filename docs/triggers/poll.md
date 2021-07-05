---
title: "Poll"
metaTitle: "Actionsflow Poll trigger"
metaDescription: "Poll trigger is triggered when new items of a rest API are detected."
---

Poll trigger is triggered when new items of a rest API are detected.

[View trigger on Github](https://github.com/actionsflow/actionsflow/blob/main/packages/actionsflow/src/triggers/poll.ts)

# Usage

Watching new item in API `https://jsonplaceholder.typicode.com/posts` response:

```yaml
on:
  poll:
    url: https://jsonplaceholder.typicode.com/posts
    deduplicationKey: id
```

Or, multiple urls:

```yaml
on:
  poll:
    url:
      - https://jsonplaceholder.typicode.com/comments?postId=1
      - https://jsonplaceholder.typicode.com/comments?postId=2
    deduplicationKey: id
```

> Note, the response structure should be same if using multiple urls

## Options

- `url`, required, `string` or `string[]`, the polling API URL, for example, `https://jsonplaceholder.typicode.com/posts`, if using multiple urls the response structure should be same.

- `itemsPath`, optional, if the API's returned JSON is not a list and is instead an object (maybe paginated), you can configure `itemsPath` as the key that contains the results. Example: `results`, `items`, `data.items`, etc... The default value is `undefined`, which means the API's response should be a list. If `itemsPath` is not specified and the API's response is an object, the object will be converted to an `items` array.

- `deduplicationKey`, optional. The poll trigger deduplicates the array we see each poll against the id key. If the id key does not exist, you should specify an alternative unique key to deduplicate, you can use path format, like: `id`, `data.id`, `item.data.key`, If neither are supplied, we fallback to looking for `key`, if neither are supplied, we will hash the item, and generate a unique key

- `shouldIncludeRawBody`, optional, `boolean`, the default value is `false`, if `true`, then you can use the whole body as you need. For example:

  ```yaml
  on:
    poll:
      url: https://jsonplaceholder.typicode.com/posts
      shouldIncludeBody: true
      config:
        limit: 5
  jobs:
    print:
      name: Print
      runs-on: ubuntu-latest
      steps:
        - name: Print Outputs
          env:
            rawBody: ${{ toJSON(on.poll.outputs.raw__body) }}
          run: |
            echo "rawBody: $rawBody"
  ```

- `shouldIncludeRequest`, optional, `boolean`, the default value is `false`, if `true`, then the request config will be added to the item's property `__request`, for example:

```yaml
on:
  poll:
    url: https://jsonplaceholder.typicode.com/posts
    shouldIncludeRequest: true
    config:
      limit: 5
jobs:
  print:
    name: Print
    runs-on: ubuntu-latest
    steps:
      - name: Print Outputs
        env:
          __request: ${{ toJSON(on.poll.outputs.__request) }}
        run: |
          echo "__request: $__request"
```

The `__request` will be like ` { "url": "https://jsonplaceholder.typicode.com/posts" }`

- `requestConfig`, optional, we use [Axios](https://github.com/axios/axios) for polling data, so your can pass all params that [axios supported](https://github.com/axios/axios#request-config). For example:

  ```yaml
  on:
    poll:
      url: https://jsonplaceholder.typicode.com/posts
      requestConfig:
        method: POST
        headers:
          Authorization: Basic YWxhZGRpbjpvcGVuc2VzYW1l
  ```

- `requestConfig.axios-retry`, optional, [`axios-retry`](https://github.com/softonic/axios-retry) params, you can configure the number of times to retry, for example:

```yaml
on:
  poll:
    url: https://fb067a39e21871a3c38f8569d28d5aba.m.pipedream.net/
    requestConfig:
      axios-retry:
        retries: 3
jobs:
  print:
    name: Print
    runs-on: ubuntu-latest
    steps:
      - name: Print Outputs
        env:
          title: ${{ on.poll.outputs.id }}
        run: |
          echo "title: $title"
```

> You can use [General Config for Actionsflow Trigger](../workflow.md#ontriggerconfig) for more customization.

## Outputs

Poll trigger's outputs will be the item of the API results

> Note, is you set `shouldIncludeRawBody`, then you will get `raw__body` for the whole raw body

An outputs example:

```json
{
  "userId": 1,
  "id": 1,
  "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
  "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
}
```

You can use the outputs like this:

```yaml
on:
  poll:
    url: https://jsonplaceholder.typicode.com/posts
    config:
      limit: 5
jobs:
  print:
    name: Print
    runs-on: ubuntu-latest
    steps:
      - name: Print Outputs
        env:
          title: ${{ on.poll.outputs.title }}
          body: ${{ on.poll.outputs.body }}
        run: |
          echo "title: $title"
          echo "body: $body"
```
