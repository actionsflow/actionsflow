---
title: "Upgrade"
metaTitle: "Actionsflow Upgrade"
---

There are two things to upgrade to the latest version of Actionsflow.

# 1. Upgrade Actionsflow to the Latest Version

The first thing is to upgrade to [the latest version of actionsflow](https://github.com/actionsflow/actionsflow/releases).

- For workflow repo only rely on the official triggers, you don't need do anything. We use github action `actionsflow/actionsflow@v1` to build your workflows, the version `v1` will also point to the latest release version.

- For workflow repo who rely on 3rd party triggers, to upgrade the latest version, you should run the following command at your repo's root folder:

  ```bash
  npm update
  ```

  then, commit & push your updates to github.

# 2. Upgrade Github Actions workflow file

The second thing is to update the [`.github/workflows/actionsflow.yml`](https://github.com/actionsflow/actionsflow-workflow-default/blob/main/.github/workflows/actionsflow.yml) to the latest version.

You should check the [actionsflow-workflow-default release](https://github.com/actionsflow/actionsflow-workflow-default/releases) to get whether there are any updates.

> Normally, we do not change the Github actions workflow file. If there is a change, it must be a break change!
