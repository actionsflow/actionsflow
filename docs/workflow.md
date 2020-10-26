---
title: "Workflow Syntax"
metaTitle: "Workflow Syntax for Actionsflow"
---

Like the [Github actions workflows](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions), a Actionsflow workflow is a configurable automated process made up of one or more jobs. You must create a YAML file to define your workflow configuration. The Actionsflow configuration format is the same as [Github actions](https://docs.github.com/en/actions/configuring-and-managing-workflows/configuring-a-workflow)'.

Workflow files use YAML syntax and must have either a `.yml` or `.yaml` file extension. If you're new to YAML and want to learn more, see "[Learn YAML in five minutes](https://www.codeproject.com/Articles/1214409/Learn-YAML-in-five-minutes)".

You must store workflow files in the `workflows` directory on your repository.

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

The following doc will give you more details on the workflow syntax:

# `on`

Required. The name of the Actionsflow trigger. Triggers are how your workflows can start automated workflows whenever they add or update something in your workflow.

For a list of available triggers, see "[Triggers](./triggers.md)".

Example using RSS trigger:

```yaml
on:
  rss:
    url: https://hnrss.org/newest?points=300
```

**Context and expression syntax for Actionsflow on**:

You can access context information in workflow triggers. You need to use specific syntax to tell Actionsflow to evaluate a variable rather than treat it as a string:

```yaml
${{ <context> }}
```

For now, you can use [`secrets`](https://docs.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets) and [`github`](https://docs.github.com/en/actions/reference/context-and-expression-syntax-for-github-actions#github-context) as trigger's context. The two objects are set by Github actions and you can use them in the trigger config. For example:

```yaml
on:
  telegram_bot:
    token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
```

## `on.<trigger>`

Optional. The trigger's options. The default value is `{}` and you can find the available params in the trigger's documentation.

## `on.<trigger>.config`

Optional. You can use `config` to configure the general options for the Actionsflow trigger. These options are handled by Actionsflow, so all triggers accept these configurations.

For example:

```yaml
on:
  rss:
    url: https://hnrss.org/newest?points=300
    config:
      limit: 15
```

The `config` key has the following options:

## `on.<trigger>.config.every`

Optional, `number` or `string`. The interval of time in which the trigger should run. If the `every` value type is `number`, the unit is minute. The default value is `0`, which means the trigger will be ran once every Github Actionsflow workflow runs. But due to the limitation of the [shortest interval of github actions](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#schedule), generally Actionsflow will run once every 5 minutes.

You can use `number` to specify the interval of time for running a trigger. Using `60`, means the trigger will be ran once every 60 minutes. You can also use a [cron expression](https://en.wikipedia.org/wiki/Cron) for the `every` option. For example, you can use `1 * * * *` to run every 60 minutes (now using the cron expression syntax). We use [`cron-parser`](https://github.com/harrisiirak/cron-parser#readme) to parse cron expression, allowing you to define a more complex trigger schedule.

For example, if you want to run a trigger at 7:00 AM weekly, you can use the following config:

```yaml
on:
  rss:
    url: https://hnrss.org/newest?points=300
    config:
      every: "0 7 * * 1-5"
```

> Note: the default time zone is `UTC`, so if you set a cron expression, you should take that into account. You can also change the time zone by using `on.<trigger>.config.timeZone`.

> Note: webhook events will ignore the `every` config.

## `on.<trigger>.config.timeZone`

Optional. `string`, time zone, the default value is `UTC`, used for parsing `on.<trigger>.config.every` cron expression, see more time zone string at [here](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

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

Example for not include `interviews`

```yaml
on:
  rss:
    url: https://hnrss.org/newest?points=300
    config:
      filter:
        title:
          $not:
            $regex: interviews
```

Learn more about MongoDB query language, please see [`MongoDB query documents`](https://docs.mongodb.com/manual/tutorial/query-documents/index.html) and [`mingo`](https://github.com/kofrasa/mingo).

## `on.<trigger>.config.filterOutputs`

Optional, [`MongoDB query language projection syntax`](https://docs.mongodb.com/manual/reference/method/db.collection.find/index.html#find-projection). You can use `filterOutputs` to filter the results fields of the trigger's outputs as you need.

Actionsflow uses [`mingo`](https://github.com/kofrasa/mingo) (a tool to use MongoDB query language for in-memory objects) to filter the trigger's outputs. For example, the following email trigger outputs which include `date`, `subject`, and `subject` will only [include the first 7 bytes](https://docs.mongodb.com/manual/reference/operator/aggregation/substrBytes/):

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

The resulting `outputs` when the trigger runs will include `date`, `subject` key:

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

To learn more about MongoDB query projection syntax, please see [`MongoDB query language projection syntax`](https://docs.mongodb.com/manual/reference/method/db.collection.find/index.html#find-projection) and [`mingo`](https://github.com/kofrasa/mingo).

## `on.<trigger>.config.format`

Optional, `js function code`. You can use `format` to filter results fields of the trigger's outputs as you need. `format` will be called after `filterOutputs`. You can use `format` like this:

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

## `on<trigger>.config.outputsMode`

Optional, available value is `separate` or `combine`, the default value is `separate`. For example, if a RSS trigger fetched 5 items once, if `outputsMode` is `separate`, then jobs of your workflow will be called 5 times with single item every time. If `outputsMode` is `combine`, then the jobs will be called only once, and the `outputs` will be an array witch includes 5 items. Such like daily digest is recommended to use `combine` mode.

With `separate`:

```yaml
on:
  rss:
    url: https://hnrss.org/newest?points=300
jobs:
  print:
    name: Print
    runs-on: ubuntu-latest
    steps:
      - name: Print Outputs
        env:
          title: ${{on.rss.outputs.title}}
        run: |
          echo title: $title
```

With `combine`

```yaml
on:
  rss:
    url: https://hnrss.org/newest?points=300
    config:
      outputsMode: combine
jobs:
  print:
    name: Print
    runs-on: ubuntu-latest
    steps:
      - name: Print Outputs
        env:
          title: ${{on.rss.outputs[0].title}}
          length: ${{ on.rss.outputs.length }}
        run: |
          echo title: $title
          echo length: $length
```

## `on.<trigger>.config.resultsPerWorkflow`

Optional, `number` or `undefined`, the default is `undefined`, you can define the built workflow jobs length, if `undefined`, all outputs will be build to one single workflow. Generally, if your source data is large, you can use `resultsPerWorkflow` to separate the built workflow files to save space.

## `on.<trigger>.config.sort`

Optional, [`MongoDB query language sort syntax`](https://docs.mongodb.com/manual/reference/method/cursor.sort/index.html). You can use `sort` to change the order of the trigger's results as you need.

Actionsflow uses [`mingo`](https://github.com/kofrasa/mingo) (a tool to use MongoDB query language for in-memory objects) to sort the trigger's results. For example, the following workflow will sort the triggers results by descending order:

```yaml
on:
  poll:
    url: https://jsonplaceholder.typicode.com/posts
    config:
      limit: 1
      sort:
        id: -1
```

To learn more about MongoDB query sort syntax, please see [`MongoDB query language sort syntax`](https://docs.mongodb.com/manual/reference/method/cursor.sort/index.html) and [`mingo`](https://github.com/kofrasa/mingo).

## `on.<trigger>.config.limit`

Optional, `number`. The trigger's results max length. The default value is `undefined`, which means the trigger will handle all items.

## `on.<trigger>.config.skip`

Optional, `number`. Skip `<count>` results of the trigger's results. The default value is `undefined`, which means the trigger will handle all items.

## `on.<trigger>.config.active`

Optional, `boolean`. Configures whether the trigger is active (defaults to `true`). You can deactivate triggers by setting `active: false`.

## `on.<trigger>.config.skipFirst`

Optional, `boolean`. Configures whether the trigger skips the first time data is obtained. If `true`, the trigger will run the next time it get data. The default value is `false`.

## `on.<trigger>.config.shouldDeduplicate`

Optional, `boolean`. Configures if the trigger's results should be deduplicated. The default value is dictated by the trigger. You use this setting to override the trigger's default configuration.

## `on.<trigger>.config.manualRunEvent`

Optional, `string` or `string[]`. Github actions events that should trigger this trigger to run manually. The default value is `[]`, but you can use `push`, `workflow_dispatch` and `repository_dispatch` as values.

For example, if you set a trigger's `every` configuration as `1 2 * * *` and you don't want to wait to `02:01` to test your trigger, you can config `workflow_dispatch` as a trigger's `manualRunEvent`. Then, if a [`workflow_dispatch`](https://docs.github.com/en/free-pro-team@latest/actions/reference/events-that-trigger-workflows#workflow_dispatch) event occurs, your trigger will be triggered.

## `on.<trigger>.config.force`

Optional, `boolean`. Whether to force data to be updated. If `true`, the trigger will ignore cache, `every`, and last update time. The default value is `false`.

## `on.<trigger>.config.skipOnError`

Optional, `boolean`. Set to `true` for Actionsflow to ignore the error of this trigger when it runs and fails. The default value is `false`, Actionsflow will throw an error finally, Github may send an email to notice you the error.

## `on.<trigger>.config.buildOutputsOnError`

Optional, `boolean`. Set to `true`, Actionsflow will build a workflow with `on.<trigger>.outcome` as `true`, `on.<trigger>.outputs` as `{}` from failing when a trigger fails. The default value is `false` - Actionsflow will skip the build outputs for this trigger this time.

## `on.<trigger>.config.logLevel`

Optional, `string`. Log level for trigger. The default value is `info` but you can use `trace`, `debug`, `info`, `warn` and `error`.

## `on.<trigger>.config.debug`

Optional, `boolean`. Whether the trigger enables debug mode or not. The default value is `false`. If `true`, then the `logLevel` will be `debug`, and the trigger will be triggered when any event occurs (like `push`, `workflow_dispatch`, `repository_dispatch`).

## `on.<trigger>.config.skipSchedule`

Optional, `boolean`. Whether the trigger should skip schedule event. The default is `false`. If `true`, the trigger will ignore the `every` param and not run when triggered by the `schedule` event. Use this param when you want a trigger to run only manually.

## `on.<trigger>.<param>`

Optional. The trigger's options, defined by the specific trigger. You should read the trigger's documentation to see all available options for the trigger. For example, for the [`rss`](./triggers/rss.md) trigger:

```yaml
on:
  rss:
    url: https://hnrss.org/newest?points=300
    config:
      limit: 15
```

# `jobs`

A workflow run is made up of one or more jobs. Jobs run in parallel by default. To run jobs sequentially, you can define dependencies on other jobs using the `jobs.<job_id>.needs` keyword.

The jobs configuration format is the same as [Github actions jobs](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobs), so you can learn more about them [here](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobs).

Actionsflow supports almost all [Github actions](https://github.com/marketplace?type=actions) by using [act](https://github.com/nektos/act) (a tool for running GitHub Actions locally).

A typical job looks like this:

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

For more actions, please see [Awesome Actions List we Collected](./actions.md) and [Github Actions Marketplace](https://github.com/marketplace?type=actions).

**Context and expression syntax for Actionsflow jobs**:

You can access context information in workflow jobs. You need to use specific syntax to tell Actionsflow to evaluate a variable rather than treat it as a string:

```yaml
${{ <context> }}
```

All [Github actions contexts and expressions](https://docs.github.com/en/actions/reference/context-and-expression-syntax-for-github-actions) are supported by Actionsflow, and we extend the `on` context for the trigger's results. You can use it like this:

```yaml
${{ on.<trigger>.outputs.<key> }}
```

You can find params and outputs keys supported by the trigger by looking at the trigger's documentation.

All triggers will export the following key:

## `on.<trigger>.outputs`

A map of outputs for a trigger's result item. The trigger's outputs are available on all jobs.

Trigger outputs are `object`s. You can use them like this: `${{ on.telegram_bot.from.first_name }}`

By default, `on.<trigger>.outputs` will always be available, unless you set `buildOutputsOnError` as `true`. When `buildOutputsOnError` is `true`, and the trigger runs with an error, then the outputs will be `{}`. You can use `on.<trigger>.outcome` to check if the trigger is triggering errors. When `on.<trigger>.outcome` is `failure`, then the `on.<trigger>.outputs` will be `{}`.

## `on.<trigger>.outcome`

The result of a completed trigger. Possible values are `success`, `failure`, or `skipped`.

If there is only one trigger on a workflow file, by default, `outcome` will always be `success`. If you set the trigger options `buildOutputsOnError: true` and the trigger runs with an error, the `outcome` will be `failure`, but the final `conclusion` is `success`.

If you set multiple triggers on one workflow, only one trigger's `outcome` is `success`. The other `outcome`s will be `skipped`, so you should use `if: on.<trigger>.outcome === 'success'` to ensure the current `<trigger>.outputs.<key>` is available.

## `on.<trigger>.conclusion`

The result of a completed trigger. Possible values are `success`, or `skipped`.

If there is only one trigger on a workflow file, `conclusion` will always be `success`.

If you set multiple triggers on one workflow, only one trigger's `conclusion` is `success`, the other `conclusion`s will be `skipped`.

# Learn More

For a list of available triggers, see [Trigger List](./triggers.md).

For a list of awesome workflows, see [Awesome Actionsflow Workflows](https://github.com/actionsflow/awesome-actionsflow).
