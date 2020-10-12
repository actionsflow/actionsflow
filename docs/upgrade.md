---
title: "Upgrade"
metaTitle: "Upgrade Actionsflow"
---

There are two things you need to do to upgrade to the latest version of Actionsflow.

# 1. Upgrade Actionsflow to the Latest Version

The first thing is to upgrade to [the latest version of Actionsflow](https://github.com/actionsflow/actionsflow/releases).

- For workflow repos that only rely on the official triggers, you don't need do anything. We use the Github action `actionsflow/actionsflow@v1` to build your workflows. The version `v1` will also point to the latest release version.

- For workflow repos that rely on 3rd party triggers, you should run the following command at your repo's root folder to upgrade to the latest versions:

  ```bash
  npm update
  ```

  Then, commit & push your updates to Github.

# 2. Upgrade Github Actions workflow file

The second thing is to update the [`.github/workflows/actionsflow.yml`](https://github.com/actionsflow/actionsflow-workflow-default/blob/main/.github/workflows/actionsflow.yml) file to the latest version.

You should check the [actionsflow-workflow-default release](https://github.com/actionsflow/actionsflow-workflow-default/releases) to figure out whether there are any updates.

> Normally, we do not change the Github actions workflow file. If there is a change, it must be a break change!
