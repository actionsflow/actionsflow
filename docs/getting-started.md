---
title: "Getting Started"
metaTitle: "Actionsflow Getting Started"
---

Get started with Actionsflow, the free, open-source tool for building powerful workflows.

> For self-hosted version please see [here](/docs/self-hosted.md)

Building an Actionsflow workflow is basically a four-step process:

# 1. Create a Github repository

Click [this link](https://github.com/actionsflow/actionsflow-workflow-default/generate) to generate a new public Github repository using the Actionsflow template. Choose whatever repository name you like (for example: `actionsflow-workflow`, `workflow`, `my-workflow`).

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

# 2. **Uncomment `.github/workflows/actionsflow.yml` schedule event**

   ```yml
   on:
     schedule:
       - cron: "*/15 * * * *"
   ```

   > Note: To prevent abuse, by default, the schedule is commented, please modify the schedule time according to your own needs, the default is once every 15 minutes. Learn more about schedule event, please see [here](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#schedule)

# 3. Create workflow files

Define your [workflow files](https://actionsflow.github.io/docs/workflow/) inside the `workflows` directory.

A typical workflow file `rss.yml` looks like this:

```yaml
on:
  rss:
    url: https://hnrss.org/newest?points=300&count=3
jobs:
  request:
    name: Make a HTTP Request
    runs-on: ubuntu-latest
    steps:
      - name: Make a HTTP Request
        uses: actionsflow/axios@v1
        with:
          url: https://hookb.in/VGPzxoWbdjtE22bwznzE
          method: POST
          body: |
            {
              "link":"${{ on.rss.outputs.link }}", 
              "title": "${{ on.rss.outputs.title }}",
              "content":"<<<${{ on.rss.outputs.contentSnippet }}>>>"
            }
```

For more information about the Actionsflow workflow file, see the
[Actionsflow workflow reference](./workflow.md).

You can find examples and inspiration on the [Trigger List](/docs/triggers.md) and on [Awesome Actionsflow Workflows](https://github.com/actionsflow/awesome-actionsflow).

# 4. Commit and push your updates to Github

You can edit your workflow files online at [Github](https://github.com), so you can submit your commit directly.

Or, you can also clone your repository to your local machine and manually submit your commit:

```bash
git commit -m "build: edit workflow file" -a
git push
```

After pushing your commit by using either option above, Actionsflow runs the workflows you defined. You can view logs at your repository's actions tab on [Github](https://github.com).

# Learn More

- [Workflow Syntax for Actionsflow](./workflow.md) - Learn more about the Actionsflow workflow file syntax
- [Trigger List](./triggers.md) - Explore Actionsflow triggers
- [Awesome Actionsflow Workflows](https://github.com/actionsflow/awesome-actionsflow) - Explore and get inspired by other Actionsflow workflow use-cases
- [Core Concepts](./concepts.md) - Learn more about how Actionsflow works
- [Creating Triggers for Actionsflow](./creating-triggers.md) - Learn more about how to create your own trigger for Actionsflow
- [FAQs](./faqs.md) - Actionsflow FAQs
