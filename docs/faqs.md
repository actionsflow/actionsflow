---
title: FAQs
metaTitle: "Actionsflow Getting Started"
---

# Getting help

Actionsflow is under active development. If you need help, would like to
contribute, or simply want to talk about the project with like-minded
individuals, we have a number of open channels for communication.

- To report bugs, file feature requests, or submit trigger wanted: use the [issue tracker on Github](https://github.com/actionsflow/actionsflow/issues).
- To contribute code or documentation changes: submit a [pull request on Github](https://github.com/actionsflow/actionsflow/pulls).
- To communicate/need help with Actionsflow users: join [Actionsflow Slack](https://join.slack.com/t/actionsflow/shared_invite/zt-h5tmw9cn-GbZ4fzU_vc_qB~nnS_2Lvg)

# FAQs

## 1. How to set a scheduled/cron event?

Yes, you can set a cron event on Actionsflow, see [`on.<trigger>.config.every`](workflow.md#ontriggerconfigevery)

## 2. How to debug trigger outputs?

For example, if you want to debug the RSS trigger outputs, you can use [`toJSON` function provided by Github](https://docs.github.com/en/free-pro-team@latest/actions/reference/context-and-expression-syntax-for-github-actions#tojson) like this:

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
          outputs: ${{ toJSON(on.rss.outputs) }}
        run: |
          echo outputs: $outputs
```

## 3. How to debug?

If you want to debug a specific trigger, you can pass [`debug: true`](workflow.md#ontriggerconfigdebug) to the trigger.

If some errors occur, maybe you want to debug it. To enable Github Actions step debug logging, you must set the following secret in the repository that contains the workflow: `ACTIONS_STEP_DEBUG` to true. If so, Actionsflow will set `logLevel: debug`, so you can debug the details. For more about debug please see [Enabling debug logging
](https://docs.github.com/en/free-pro-team@latest/actions/managing-workflow-runs/enabling-debug-logging)

## 4. How to clean cache?

For some reason, you may want to delete the Actionsflow's cache, then you can manual run this workflow at your repository Actions tab.

## 5. How to run single workflow?

When you have multiple workflow files, you want run only some workflows of them. You can set [`on.<trigger>.config.active`](https://actionsflow.github.io/docs/workflow/#ontriggerconfigactive) as `false`, or you can use [`--include`](https://actionsflow.github.io/docs/reference/cli/#build) args, `npm run build -- -i rss.yml`, or glob `npm run build -- -i "rss*"`

## 6. `argument list too long` Error

If you received this error [`OCI runtime exec failed: exec failed: container_linux.go:370: starting container process caused: argument list too long: unknown`](https://github.com/actionsflow/actionsflow/issues/4) when run `act`. This because your built workflow file is too large for [`act`](https://github.com/nektos/act) to handle. You'd better reduce your outputs by using [`on.<trigger>.config.filterOutputs`](https://actionsflow.github.io/docs/workflow/#ontriggerconfigfilteroutputs), For example:

```yaml
on:
  rss:
    url:
      - https://hnrss.org/newest?points=500
      - https://hnrss.org/show?points=100
    config:
      filterOutputs:
        title: 1
        link: 1
```

Then, only `title`, `link` will be placed to outputs.
