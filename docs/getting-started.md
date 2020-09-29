---
title: "Getting Started"
metaTitle: "Actionsflow Getting Started"
---

Get started with Actionsflow, the free, open-source tool for building powerful workflows.

Build an Actionsflow workflow is basically a three-step process:

# 1. Create a Github repository

Click this [link](https://github.com/actionsflow/actionsflow-workflow-default/generate) to generate a new public Github repository, pick a repository name as you like, for example, `actionsflow-workflow`, `workflow`, `my-workflow`

A typical Actionsflow repository structure looks like this:

```sh
├── .github
│   └── workflows
│       └── actionsflow.yml
├── .gitignore
├── README.md
└── workflows
│   └── rss.yml
│   └── webhook.yml
└── package.json
```

# 2. Create workflow files

Define your [workflow files](https://actionsflow.github.io/docs/workflow/) at `workflows` directory.

A typical workflow file `rss.yml` looks like this:

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

For more information about the Actionsflow workflow file, see the
[Actionsflow workflow reference](./workflow.md).

You can explore [Triggers List](https://actionsflow.github.io/docs/triggers/) or [Awesome Actionsflow Workflows](https://github.com/actionsflow/awesome-actionsflow/) to get more inspired.

# 3. Commit and push your updates to Github

You can edit your workflow files online at [Github](https://github.com), so you can submit your commit directly.

Or, you can also clone your repository to local, and submit your commit by command:

```bash
git commit -m "build: edit workflow file" -a
git push
```

Then, Actionsflow will run your workflows as you defined, you can view logs at your repository actions tab at [Github](https://github.com)

# Learn More

- [Workflow Syntax for Actionsflow](./workflow.md) - Learn more about the Actionsflow workflow file syntax
- [Triggers List](./triggers.md) - Explore Actionsflow triggers
- [Awesome Actionsflow Workflows](https://github.com/actionsflow/awesome-actionsflow) - Explore Actionsflow workflows use case to get inspired
- [Core Concepts](./concepts.md) - Learn more about how Actionsflow worked
- [Creating Triggers for Actionsflow](./creating-triggers.md) - Learn more about how to create your own trigger for Actionsflow
- [FAQs](./faqs.md) - Actionsflow FAQs
