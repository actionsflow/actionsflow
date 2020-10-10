---
title: "Workflow Syntax"
metaTitle: "Workflow Syntax for Actionsflow"
---

Like [Github actions workflow](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions), A Actionsflow workflow is a configurable automated process made up of one or more jobs. You must create a YAML file to define your workflow configuration. The Actionsflow configuration format is the same as [Github actions](https://docs.github.com/en/actions/configuring-and-managing-workflows/configuring-a-workflow)

Workflow files use YAML syntax and must have either a `.yml` or `.yaml` file extension. If you're new to YAML and want to learn more, see "[Learn YAML in five minutes.](https://www.codeproject.com/Articles/1214409/Learn-YAML-in-five-minutes)"

You must store workflow files in the `workflows` directory of your repository.

A typical workflow file `workflow.yml` looks like this:

```yaml
on:
  rss:
    url: https://hnrss.org/newest?points=300
jobs:
  ifttt:
    name: Make a Request to IFTTT
    runs-on: ubuntu-latest
    steps:
      - uses: actionsflow/ifttt-webhook-action@v1
        with:
          event: notice
          key: ${{ secrets.IFTTT_KEY }}
          value1: ${{on.rss.outputs.title}}
          value2: ${{on.rss.outputs.contentSnippet}}
          value3: ${{on.rss.outputs.link}}
```

The following doc will show you about workflow syntax:

# `on`

Required, The name of the Actionsflow trigger. Triggers are how your workflows can start automated workflows whenever they add or update something in your workflow.

For a list of available triggers, see "[Triggers](./triggers.md)"

Example using RSS trigger:

```yaml
on:
  rss:
    url: https://hnrss.org/newest?points=300
```

**Context and expression syntax for Actionsflow on**:

You can access context information in workflow triggers, you need to use specific syntax to tell Actionsflow to evaluate a variable rather than treat it as a string.

```yaml
${{ <context> }}
```

For now, you can use [`secrets`](https://docs.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets), and [`github`](https://docs.github.com/en/actions/reference/context-and-expression-syntax-for-github-actions#github-context) as trigger's context, the two objects are set by Github actions, you can use them in trigger config. For example:

```yaml
on:
  telegram_bot:
    token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
```

## `on.<trigger>`

Optional, the options of the trigger, the default value is `{}`, You can find the trigger's documentation for getting the available params.

## `on.<trigger>.config`

Optional, you can use `config` to configure the general options for Actionsflow trigger. These options are handled by Actionsflow, so all triggers accept these options.

For example:

```yaml
on:
  rss:
    url: https://hnrss.org/newest?points=300
    config:
      limit: 15
```

The `config` has the following options.

## `on.<trigger>.config.filter`

Optional, [`MongoDB query language`](https://docs.mongodb.com/manual/tutorial/query-documents/index.html). You can use `filter` to filter the trigger's results as you need.

Actionsflow use [`mingo`](https://github.com/kofrasa/mingo)(A tool to use MongoDB query language for in-memory objects) for filter the trigger's results. For example, the following workflow will only be triggered when RSS feed `title` contains `interviews`:

```yaml
on:
  rss:
    url: https://hnrss.org/newest?points=300
    config:
      filter:
        title:
          $regex: interviews
```

Learn more about MongoDB query language, please see [`MongoDB query documents`](https://docs.mongodb.com/manual/tutorial/query-documents/index.html) and [`mingo`](https://github.com/kofrasa/mingo).

## `on.<trigger>.config.filterOutputs`

Optional, [`MongoDB query language projection syntax`](https://docs.mongodb.com/manual/reference/method/db.collection.find/index.html#find-projection). You can use `filterOutputs` to filter result's field of the trigger's outputs as you need.

Actionsflow use [`mingo`](https://github.com/kofrasa/mingo)(A tool to use MongoDB query language for in-memory objects) for filter the trigger's outputs. For example, the following email trigger outputs will include `date`, `subject`, and `subject` will only [include the first 7 bytes](https://docs.mongodb.com/manual/reference/operator/aggregation/substrBytes/):

```yaml
on:
  email:
    imap:
      host: outlook.office365.com
      user: ${{secrets.EMAIL_USER}}
      password: ${{secrets.EMAIL_PASSWORD}}
    config:
      filterOutputs:
        date: 1
        subject:
          $substrBytes:
            - $subject
            - 0
            - 7
```

Trigger built result, `outputs` will include `date`, `subject` key:

```json
{
  "outcome": "success",
  "conclusion": "success",
  "outputs": {
    "date": "2020-09-15T21:14:26.000Z",
    "subject": "Hello"
  }
}
```

Learn more about MongoDB query projection syntax, please see [`MongoDB query language projection syntax`](https://docs.mongodb.com/manual/reference/method/db.collection.find/index.html#find-projection) and [`mingo`](https://github.com/kofrasa/mingo).

## `on.<trigger>.config.format`

Optional, `js function code`. You can use `format` to filter result's field of the trigger's outputs as you need. `format` will be called after `filterOutputs`. You can use `format` like this:

```yaml
name: A really complex example
on:
  poll:
    url: https://jsonplaceholder.typicode.com/posts
    config:
      format: |
        item.title = item.title.substring(0,5)
        return item;
```

## `on.<trigger>.config.sort`

Optional, [`MongoDB query language sort syntax`](https://docs.mongodb.com/manual/reference/method/cursor.sort/index.html), You can use `sort` to change the order of the trigger's results as you need.

Actionsflow use [`mingo`](https://github.com/kofrasa/mingo)(A tool to use MongoDB query language for in-memory objects) for sort the trigger's results. For example, the following workflow will sort the triggers results by descending:

```yaml
on:
  poll:
    url: https://jsonplaceholder.typicode.com/posts
    config:
      limit: 1
      sort:
        id: -1
```

Learn more about MongoDB query sort syntax, please see [`MongoDB query language sort syntax`](https://docs.mongodb.com/manual/reference/method/cursor.sort/index.html) and [`mingo`](https://github.com/kofrasa/mingo).

## `on.<trigger>.config.limit`

Optional, `number`, the trigger's results max length, the default value is `undefined`, it means the trigger will handle all items

## `on.<trigger>.config.skip`

Optional, `number`, skip `<count>` results of the trigger's results , the default value is `undefined`, it means the trigger will handle all items

## `on.<trigger>.config.active`

Optional, `boolean`, if the trigger is active, default is `true`. for some reason, you can make trigger inactive by set `active: false`

## `on.<trigger>.config.every`

Optional, `number` or `string`, the interval time of running trigger, the unit is minute, the default value is `5`, you can also use [cron expression](https://en.wikipedia.org/wiki/Cron), we use [`cron-parser`](https://github.com/harrisiirak/cron-parser#readme) to parse cron expression, with cron, you can define a more complex trigger schedule.

For example, if you want run a trigger hourly, you can use the following config:

```yaml
on:
  rss:
    url: https://hnrss.org/newest?points=300
    config:
      every: 60
```

Or, use cron expression:

```yaml
on:
  rss:
    url: https://hnrss.org/newest?points=300
    config:
      every: 0 * * * *
```

> Note, webhook event will ignore `every` config

> Note, the default time zone is `UTC`, so if you set a cron expression, you should notice it. You can also change the time zone by `on.<trigger>.config.timeZone`

## `on.<trigger>.config.timeZone`

Optional, `string`, time zone, the default value is `UTC`, used for parsing `on.<trigger>.config.every` cron expression, see more time zone string at [here](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

## `on.<trigger>.config.skipFirst`

Optional, `boolean`, whether to skip the data obtained for the first time, if `true`, the trigger will run the next time it get data. The default value is `false`

## `on.<trigger>.config.shouldDeduplicate`

Optional, `boolean`, if the trigger's results should be dedeplicate, the default value is decided by the trigger, you can force to override it.

## `on.<trigger>.config.manualRunEvent`

Optional, `string` or `string[]`, github actions events that should trigger this trigger run manually, the default value is `[]`, you can use `push`, `workflow_dispatch`, `repository_dispatch` as `manualRunEvent` value.

For example, if you set a trigger `every` as `1 2 * * *`, then, you don't wait to `02:01` to test your trigger, you can config `workflow_dispatch` as a trigger's `manualRunEvent`, then, if a [`workflow_dispatch`](https://docs.github.com/en/free-pro-team@latest/actions/reference/events-that-trigger-workflows#workflow_dispatch) event occurred, your trigger will be triggered.

## `on.<trigger>.config.force`

Optional, `boolean`, whether to force data to be updated, if `true`, the trigger will ignore cache, every, and last update time. The default value is `false`

## `on.<trigger>.config.skipOnError`

Optional, `boolean`, Set to `true`, Actionsflow will ignore the trigger for this time if there are any fails. The default value is `false`, which means Actionsflow will throw an error, stop to build.

## `on.<trigger>.config.buildOutputsOnError`

Optional, `boolean`, Set to `true`, Actionsflow will build a workflow with `on.<trigger>.outcome` as `true`, `on.<trigger>.outputs` as `{}` from failing when a trigger fails. The default value is `false`, Actionsflow will skip to build outputs for this trigger this time.

## `on.<trigger>.config.logLevel`

Optional, `string`, log level for trigger, the default value is `info`, you can use `trace`, `debug`, `info`, `warn`, `error`

## `on.<trigger>.config.debug`

Optional, `boolean`, if debug the trigger, the default value is `false`, if `true`, then the `logLevel` will be `debug`, and the trigger will be triggered when all events occurred, like `push`, `workflow_dispatch`, `repository_dispatch`

## `on.<trigger>.config.skipSchedule`

Optional, `boolean`, if should skip schedule event, the default is `false`, if `true`, the trigger will ignore `every` param, not triggered by `schedule` event, use this param when you want a trigger run only manually.

## `on.<trigger>.<param>`

Optional, the trigger's options, defined by the specific trigger, you should read the trigger's documentation to get all options that available for the trigger. For [`rss`](./triggers/rss.md) example:

```yaml
on:
  rss:
    url: https://hnrss.org/newest?points=300
    config:
      limit: 15
```

# `jobs`

A workflow run is made up of one or more jobs. Jobs run in parallel by default. To run jobs sequentially, you can define dependencies on other jobs using the `jobs.<job_id>.needs` keyword.

The jobs configure format is the same as [Github actions jobs](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobs), so you can learn more about jobs at [here](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobs)

Actionsflow support almost all [Github actions](https://github.com/marketplace?type=actions) by using [act](https://github.com/nektos/act)(a tool for running GitHub Actions locally).

A typical job steps look like this:

```yaml
jobs:
  ifttt:
    name: Make a Request to IFTTT
    runs-on: ubuntu-latest
    steps:
      - uses: actionsflow/ifttt-webhook-action@v1
        with:
          event: notice
          key: ${{ secrets.IFTTT_KEY }}
          value1: ${{ on.rss.outputs.title }}
          value2: ${{ on.rss.outputs.contentSnippet }}
          value3: ${{ on.rss.outputs.link }}
```

For exploring more actions, please see [Awesome Actions List we Collected](./actions.md) and [Github Actions Marketplace](https://github.com/marketplace?type=actions)

**Context and expression syntax for Actionsflow jobs**:

You can access context information in workflow jobs, you need to use specific syntax to tell Actionsflow to evaluate a variable rather than treat it as a string.

```yaml
${{ <context> }}
```

All [Github actions contexts and expressions](https://docs.github.com/en/actions/reference/context-and-expression-syntax-for-github-actions) are supported by Actionsflow, and we extend `on` context for trigger's results. You can use it like this:

```yaml
${{ on.<trigger>.outputs.<key> }}
```

You can find params and outputs keys supported by the trigger at the trigger's doc.

All triggers' will export the following key:

## `on.<trigger>.outputs`

A map of outputs for a trigger results' item. Trigger's outputs are available to all jobs.

Trigger's outputs are `object`, you can use it like this: `${{ on.telegram_bot.from.first_name }}`

By default, `on.<trigger>.outputs` will always available, unless you set `buildOutputsOnError` as `true`, when `buildOutputsOnError` is `true`, and the trigger runs with error, then, the outputs will be `{}`, you can use `on.<trigger>.outcome` to check if the trigger runs with error. When `on.<trigger>.outcome` is `failure`, then the `on.<trigger>.outputs` will be `{}`

## `on.<trigger>.outcome`

The result of a completed trigger, Possible values are `success`, `failure`, or `skipped`.

If there is only one trigger at a workflow file, by default, `outcome` will always be `success`. If you set the trigger options `buildOutputsOnError: true`, then the trigger runs with error, the `outcome` will be `failure`, but the final `conclusion`is `success`.

If you set multiple triggers on one workflow, only one trigger's `outcome` is `success`, the others `outcome` will be `skipped`, so you should use `if: on.<trigger>.outcome === 'success'` to ensure the current `<trigger>.outputs.<key>` is available.

## `on.<trigger>.conclusion`

The result of a completed trigger. Possible values are `success`, or `skipped`.

If there is only one trigger at a workflow file, `conclusion` will always be `success`

If you set multiple triggers on one workflow, only one trigger's `conclusion` is `success`, the others `conclusion` will be `skipped`

# Learn More

For a list of available triggers, see [Trigger List](./triggers.md)

For a list of awesome workflows, see [Awesome Actionsflow Workflows](https://github.com/actionsflow/awesome-actionsflow)
