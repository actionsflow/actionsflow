---
title: "Self-Hosted Introduction"
metaTitle: "Actionsflow Self-Hosted Introduction"
---

Since Actionsflow v1.6.0, Actionsflow can be deployed as a self-hosted application. You can run Actionsflow by Docker or manually.

# Docker

```bash
# You can also clone your own repo
git clone https://github.com/actionsflow/actionsflow-workflow-default.git
cd actionsflow-workflow-default
docker run -it -v /var/run/docker.sock:/var/run/docker.sock -v ${PWD}:/data -p 3000:3000 actionsflow/actionsflow
```

# Mannual

## Prerequisites

1. Install [docker](https://docs.docker.com/get-docker/)
1. Install [act](https://github.com/nektos/act)

## Run

```bash
# You can also clone your own repo
git clone https://github.com/actionsflow/actionsflow-workflow-default.git
cd actionsflow-workflow-default
npm i
npm start
```

The defualt webhook endpoint will be ran at <http://localhost:3000/webhook/>
