---
title: "Script"
metaTitle: "Actionsflow Script trigger"
metaDescription: "Script trigger is triggered when call a custom script function returns."
---

You can use script trigger simply to write a script for a custom trigger logic.

[View trigger on Github](https://github.com/actionsflow/actionsflow/blob/main/packages/actionsflow/src/triggers/script.ts)

# Usage

```yaml
on:
  script:
    run: |
      const result = await helpers.axios.get("https://jsonplaceholder.typicode.com/posts")
      return result.data
    deduplicationKey: id
```

Or, you can use a `path` to run the external script. For example,

```yaml
on:
  script:
    path: ./workflows/script.js
```

> Use a relative path based on your project root directory.

## Options

- `run`, optional, the script code, you must provider `run` or `path` at least. you should use javascript language for the script. The context you can use at the script, see [here](#context), for example,

  ```javascript
  let items = [];
  if (options.param1) {
    items.push({
      id: "param1",
      title: "title1",
    });
  }
  return items;
  ```

- `path`, optional, you can run script from an external file. For example, `path: ./script.js`, the `script.js` should export following function:

  ```javascript
  module.exports = async function ({ helpers }) {
    const result = await helpers.axios.get(
      "https://jsonplaceholder.typicode.com/posts"
    );
    return result.data;
  };
  ```

  The context you can use is the same as `run`, see [here](#context)

- `deduplicationKey`, optional. The poll trigger deduplicates the array we see each poll against the id key. If the id key does not exist, you should specify an alternative unique key to deduplicate, you can use path format, like: `id`, `data.id`, `item.data.key`, If neither are supplied, we fallback to looking for `key`, if neither are supplied, we will hash the item, and generate a unique key

## Context

You can use the following context at your script code:

- `helpers`, The Actionsflow triggers general helpers, which has `cache`, `log`, etc... You can see all helpers methods at [here](../reference/trigger-helpers.md)

- `options`, the options you pass it to `script` trigger

- `github`, A `pre-authenticated` [octokit/rest.js](https://github.com/octokit/rest.js) client, **Note, if use github you must provide `github_token` params**, for example, `github

  ```yaml
  on:
  script:
    github_token: ${{secrets.GITHUB_TOKEN}}
    run: |
      const results = await github.issues.listForRepo({
        owner:"actionsflow",
        repo:"actionsflow",
      });
      return results.data;
  ```

- `require`, you can use `require` to require the `js` module. Be care for, you should use an absolute path to require the specific js file.

  ```yaml
    on:
  script:
    github_token: ${{secrets.GITHUB_TOKEN}}
    run: |
      const script = require(`${process.env.GITHUB_WORKSPACE}/path/xx.js`);
      const items = await script({
        helpers,
        options,
      });
      return items;
  ```

> You can use [General Config for Actionsflow Trigger](../workflow.md#ontriggerconfig) for more customization.

## Outputs

Script trigger's outputs will be the item of the script function results.

An outputs example:

```json
{
  "id": 1,
  "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit"
}
```

You can use the outputs like this:

```yaml
on:
  script:
    run: |
      const result = await helpers.axios.get("https://jsonplaceholder.typicode.com/posts")
      return result.data
    deduplicationKey: id
jobs:
  print:
    name: Print
    runs-on: ubuntu-latest
    steps:
      - name: Print Outputs
        env:
          title: ${{on.script.outputs.title}}
        run: |
          echo title: $title
```
