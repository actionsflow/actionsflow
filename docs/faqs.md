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

Actionsflow does not support schedule event, because Github actions support the scheduled event, you can use [Github actions](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#scheduled-events) to do it if you want.

## 2. How to debug?

If some errors occur, maybe you want to debug it. To enable Github Actions step debug logging, you must set the following secret in the repository that contains the workflow: `ACTIONS_STEP_DEBUG` to true. If so, Actionsflow will set `logLevel: debug`, so you can debug the details. For more about debug please see [Enabling debug logging
](https://docs.github.com/en/free-pro-team@latest/actions/managing-workflow-runs/enabling-debug-logging)

## 3. How to clean cache?

For some reason, you may want to delete the Actionsflow's cache, then you can manual run this workflow at your repository Actions tab.
