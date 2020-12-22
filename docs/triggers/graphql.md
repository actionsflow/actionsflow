---
title: "Graphql"
metaTitle: "Actionsflow Graphql trigger"
metaDescription: "Graphql trigger is triggered when new items of a graphql endpoint response are detected."
---

Graphql trigger is triggered when new items of a graphql endpoint response are detected.

[View trigger on Github](https://github.com/actionsflow/actionsflow/blob/main/packages/actionsflow/src/triggers/graphql.ts)

# Usage

Watching new item in API `https://countries.trevorblades.com/` response:

```yaml
on:
  graphql:
    url: https://countries.trevorblades.com/
    itemsPath: data.countries
    deduplicationKey: code
    query: |
      query {
        countries {
          code
          name
        }
      }
```

## Options

- `url`, required, the graphql API URL, for example, `https://countries.trevorblades.com/`

- `query`, required, the graphql query, for example:

  ```graphql
  query {
    countries {
      code
      name
    }
  }
  ```

- `variables`, optional, the graphql variables, the default value is `{}`

- `headers`, optional, the graphql endpoint headers, the default value is `{}`

- `itemsPath`, optional, you may need to configure `itemsPath` as the key that contains the results. Example: `data.items`, `data.posts`, etc... The default value is `data.items`

- `deduplicationKey`, optional. The graphql trigger deduplicates the array we see each graphql against the id key. If the id key does not exist, you should specify an alternative unique key to deduplicate, you can use path format, like: `id`, `data.id`, `item.data.key`, If neither are supplied, we fallback to looking for `key`, if neither are supplied, we will hash the item, and generate a unique key

- `shouldIncludeRawBody`, optional, `boolean`, the default value is `false`, if `true`, then your use the whole body as you need. For example:

  ```yaml
  on:
    graphql:
      url: https://countries.trevorblades.com/
      itemsPath: data.countries
      deduplicationKey: code
      shouldIncludeBody: true
      query: |
        query {
          countries {
            code
            name
          }
        }
  jobs:
    print:
      name: Print
      runs-on: ubuntu-latest
      steps:
        - name: Print Outputs
          env:
            rawBody: ${{ toJSON(on.graphql.outputs.raw__body) }}
          run: |
            echo "rawBody: $rawBody"
  ```

- `requestConfig`, optional, we use [Axios](https://github.com/axios/axios) for graphql data, so your can pass all params that [axios supported](https://github.com/axios/axios#request-config). For example:

  ```yaml
  on:
    graphql:
      url: https://countries.trevorblades.com/
      requestConfig:
        timeout: 30000
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

Graphql trigger's outputs will be the item of the API results

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
  graphql:
    url: https://countries.trevorblades.com/
    itemsPath: data.countries
    deduplicationKey: code
    query: |
      query {
        countries {
          code
          name
        }
      }
jobs:
  print:
    name: Print
    runs-on: ubuntu-latest
    steps:
      - name: Print Outputs
        env:
          name: ${{ on.graphql.outputs.name }}
        run: |
          echo "name: $name"
```
