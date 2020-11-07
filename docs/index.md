---
title: "Introduction"
metaTitle: "Actionsflow Introduction"
---

[Actionsflow](https://github.com/actionsflow/actionsflow) helps you automate workflows - it's a free [IFTTT](https://ifttt.com/)/[Zapier](https://zapier.com/) alternative for developers. With [Actionsflow](https://github.com/actionsflow/actionsflow) you can connect your favorite apps, data, and APIs, receive notifications of actions as they occur, sync files, collect data, and more. We implemented it based on [Github actions](https://docs.github.com/en/actions), and you use a YAML file to build your workflows. The configuration format is the same as [Github actions](https://docs.github.com/en/actions/configuring-and-managing-workflows/configuring-a-workflow), which makes it easy for you to get going if you've explored Github actions before. You can also use any [Github actions](https://github.com/marketplace?type=actions) as your job's steps.

You can learn more about the core concepts of Actionsflow [here](/docs/concepts.md).

# Features

- **Totally Free!** Actionsflow is based on [Github actions](https://docs.github.com/en/actions). To run an Actionsflow workflow, all you need to do is [create a repository from the Actionsflow template repository](https://github.com/actionsflow/actionsflow-workflow-default/generate), or, you can also [deploy a self-hosted version](/docs/self-hosted.md).
- **Leverage Community Triggers**. You can use [community-provided triggers](/docs/triggers.md#triggers-list) like Slack, RSS, Webhook, Typeform, Email, Reddit, NPM, Telegram, Twitter, etc. You can also easily [create your own triggers](/docs/creating-triggers.md).
- **Support Almost ALL Actions of [Github Actions](https://github.com/marketplace?type=actions)**. Actionsflow uses [act](https://github.com/nektos/act) (a tool for running GitHub Actions locally) to run the jobs on your workflow file. With [these awesome Github actions](/docs/actions.md), you can connect with IFTTT, Zapier, or other services like Slack, Telegram, Facebook, Twitter, Line, etc.
- **Support Self-Hosted** You can run Actionsflow based on both GitHub Repository or [a self-hosted version](/docs/self-hosted).
- **Simple Workflow Configuration**. The Actionsflow configuration format is the same as [Github actions](https://docs.github.com/en/actions/configuring-and-managing-workflows/configuring-a-workflow). If you've written a [Github actions file](https://docs.github.com/en/actions/configuring-and-managing-workflows/configuring-a-workflow) before, you'll find defining an Actionsflow workflow file really easy.
- **Run triggers every 5 minutes**. The workflow can check and run every 5 minutes based on [Github actions scheduled events](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#scheduled-events).
- **Use Webhook to Connect with any 3rd party Service**. You can easily set a webhook URL on a 3rd party service, then receive the webhook event on triggers that support webhooks.
- **Support complex workflows**. With Actionsflow you can make complex advanced workflows. Actionsflow provides a [MongoDB query language](/docs/workflow.md#ontriggerconfigfilter) for you to filter your data as you want.

# Quick Start

Building an Actionsflow workflow is a three-step process:

> For self-hosted version please see [here](/docs/self-hosted.md)

1. **Create a public Github repository by using [this link](https://github.com/actionsflow/actionsflow-workflow-default/generate).**

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

1. **Create your [workflow files](/docs/workflow.md) inside the `workflows` directory**

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
   [Actionsflow workflow reference](/docs/workflow.md).

   You can find examples and inspiration on the [Trigger List](/docs/triggers.md) and on [Awesome Actionsflow Workflows](https://github.com/actionsflow/awesome-actionsflow).

1. **Commit and push your updates to Github**

Pushing to Github makes Actionsflow run the workflows you defined. You can view logs at your repository's actions tab on [Github](https://github.com).

For more information about getting up and running, see [Getting Started](/docs/getting-started.md).

# Learn More

- [Workflow Syntax for Actionsflow](/docs/workflow.md) - Learn more about the Actionsflow workflow file syntax
- [Trigger List](/docs/triggers.md) - Explore Actionsflow triggers
- [Awesome Actionsflow Workflows](https://github.com/actionsflow/awesome-actionsflow) - Explore and get inspired by other Actionsflow workflow use-cases
- [Core Concepts](/docs/concepts.md) - Learn more about how Actionsflow works
- [Creating Triggers for Actionsflow](/docs/creating-triggers.md) - Learn more about how to create your own trigger for Actionsflow
- [FAQs](/docs/faqs.md) - Actionsflow FAQs
- [Join Actionsflow on Slack](https://forms.gle/9VvTVne6oU7zBCeVA) - Chat with other users and contributors on Slack, if you have already joined, please [signin](https://actionsflow.slack.com) directly
