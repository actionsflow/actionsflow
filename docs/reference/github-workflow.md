---
title: Actionsflow Github Workflows
---

From [How Actionsflow worked](../concepts.md), we know that Actionsflow runs based on Github actions, there are several Github workflow files with Actionsflow.

Take [`actionsflow-workflow-default`](https://github.com/actionsflow/actionsflow-workflow-default) as an example, there are 4 workflow files of Actionsflow.

The most important workflow is [`actionsflow.yml`](https://github.com/actionsflow/actionsflow-workflow-default/blob/main/.github/workflows/actionsflow.yml), which is introduced in [How Actionsflow worked](../concepts.md)

The following is an introduction to other workflows:

# [`actionsflow-reset-cache.yml`](https://github.com/actionsflow/actionsflow-workflow-default/blob/main/.github/workflows/actionsflow-reset-cache.yml)

For some reason, you may want to delete the Actionsflow's cache, then you can manual run this workflow at your repository Actions tab.

# [`actionsflow-update-dependencies.yml`](https://github.com/actionsflow/actionsflow-workflow-default/blob/main/.github/workflows/actionsflow-update-dependencies.yml)

You can update all local node modules dependencies by running this workflow.

> Of course, you can run `npm update` to manual update your dependencies. This workflow is just a quick way to update dependencies.

# [`actionsflow-upgrade-actionsflow.yml`](https://github.com/actionsflow/actionsflow-workflow-default/blob/main/.github/workflows/actionsflow-upgrade-actionsflow.yml)

You can update all local node modules dependencies by running this workflow.

> Of course, you can run `npm update actionsflow` to manual update your dependencies. This workflow is just a quick way to update it.
