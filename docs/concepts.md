---
title: "Core Concepts"
---

# How Actionsflow works

Actionsflow uses [Github Actions](https://docs.github.com/en/actions)' [**`repository_dispatch` event**](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#repository_dispatch) and [**`scheduled` event**](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#scheduled-events) every 5 minutes to run [Actionsflow triggers](./triggers.md). Those triggers generate an array of results, which are cached and deduplicated, generating a standard Github actions workflow file with the trigger result. Finally, the workflows are executed using [act](https://github.com/nektos/act) (a tool for running GitHub Actions locally).

In practical terms, the power of actionsflow comes from the following Github workflows file (`.github/workflows/actionsflow.yml`):

```yaml
name: Actionsflow
on:
  repository_dispatch:
  workflow_dispatch:
  schedule:
    - cron: "*/5 * * * *"
  push:
jobs:
  run:
    runs-on: ubuntu-latest
    name: Run
    steps:
      - uses: actions/checkout@v2
      - name: Run Actionsflow
        uses: actionsflow/actionsflow-action@main
        env:
          JSON_SECRETS: ${{ toJson(secrets) }}
          JSON_GITHUB: ${{ toJson(github) }}
      - name: Setup act
        uses: actionsflow/setup-act-for-actionsflow@v1
      - name: Run act
        run: act --workflows ./dist/workflows --secret-file ./dist/.secrets --eventpath ./dist/event.json --env-file ./dist/.env
```

## `scheduled` Run

Actionsflow sets up a Github scheduled action to run every 5 minutes. Actionsflow will call the trigger's manual `run` method to check if there are any updates to the triggers in the workflows. If an updated item is found, Actionsflow generates a standard Github actions workflow file with the item payload and calls [act](https://github.com/nektos/act) to run the built workflows.

For example, if an Actionsflow workflow file looks like this:

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
          contentSnippet: ${{on.rss.outputs.contentSnippet}}
          link: ${{on.rss.outputs.link}}
        run: |
          echo title: $title
          echo contentSnippet: $contentSnippet
          echo link: $link
```

Then, Actionsflow will call [RSS trigger](https://github.com/actionsflow/actionsflow/blob/main/packages/actionsflow/src/triggers/rss.ts) (more info [here](./triggers/rss.md)) and return data of the RSS feed items in JSON format. To do this, Actionsflow generates a standard Github actions workflow file, after doing some caching and deduplication work.

The standard Github actions workflow file it generates looks like this:

```yaml
"on":
  - push
jobs:
  print_0:
    name: Print 0
    runs-on: ubuntu-latest
    steps:
      - name: Print Outputs
        env:
          title: >-
            ${{(fromJSON(env.ACTIONSFLOW_TRIGGER_RESULT_FOR_rss_0)).outputs.title}}
          contentSnippet: >-
            ${{(fromJSON(env.ACTIONSFLOW_TRIGGER_RESULT_FOR_rss_0)).outputs.contentSnippet}}
          link: >-
            ${{(fromJSON(env.ACTIONSFLOW_TRIGGER_RESULT_FOR_rss_0)).outputs.link}}
        run: |
          echo title: $title
          echo contentSnippet: $contentSnippet
          echo link: $link
env:
  ACTIONSFLOW_TRIGGER_RESULT_FOR_rss_0: |-
    {
      "outcome": "success",
      "conclusion": "success",
      "outputs": {
        "creator": "aripickar",
        "title": "Nikola: How to Parlay an Ocean of Lies into a Partnership with GM",
        "link": "https://hindenburgresearch.com/nikola/",
        "pubDate": "Thu, 10 Sep 2020 21:24:44 +0000",
        "dc:creator": "aripickar",
        "comments": "https://news.ycombinator.com/item?id=24436721",
        "content": "\n<p>Article URL: <a href=\"https://hindenburgresearch.com/nikola/\">https://hindenburgresearch.com/nikola/</a></p>\n<p>Comments URL: <a href=\"https://news.ycombinator.com/item?id=24436721\">https://news.ycombinator.com/item?id=24436721</a></p>\n<p>Points: 316</p>\n<p># Comments: 281</p>\n",
        "contentSnippet": "Article URL: https://hindenburgresearch.com/nikola/\nComments URL: https://news.ycombinator.com/item?id=24436721\nPoints: 316\n# Comments: 281",
        "guid": "https://news.ycombinator.com/item?id=24436721",
        "isoDate": "2020-09-10T21:24:44.000Z"
      }
    }
```

Then, Actionsflow will call [act](https://github.com/nektos/act) (a tool for running GitHub Actions locally) to run the jobs in the workflow file.

## `repository_dispatch` Run

Github provides a [`repository_dispatch`](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#repository_dispatch) event which allows an outside service to trigger a Github actions workflow run.

Actionsflow uses it to support standard webhook requests.

To do this, we created the [webhook2github project](https://github.com/actionsflow/webhook2github).

This API will forward the following original webhook request:

```bash
https://webhook.actionsflow.workers.dev/<owner>/<repo>/<your-path>?__token=<your-github-personal-token>
```

To `https://api.github.com/repos/<owner>/<repo>/dispatches`, with body:

```json
{
  "event_type": "webhook",
  "client_payload": {
    "path": "<your-path>",
    "method": "<request.method>",
    "headers": "<request.headers>",
    "body": "<request body>"
  }
}
```

Then, Actionsflow will call the trigger's webhook handler to get the result items and generate a standard Github actions workflow file.

Finally, Actionsflow calls [act](https://github.com/nektos/act) (a tool for running GitHub Actions locally) on the generated workflow file, so that the jobs run.

# What the Actionsflow workflow file includes

A typical Actionsflow workflow file includes a [trigger](./triggers.md) and some jobs. Actionsflow also supports multiple triggers and multiple jobs.

To learn more about the Workflow syntax for Actionsflow, please see [here](./workflow.md).

To learn more about all Actionsflow's github workflow files, see [Actionsflow Github Workflows](./reference/github-workflow.md).
