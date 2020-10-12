---
title: "Contributing Guide"
metaTitle: "Contributing to Actionsflow"
---

It's great that you are here and that you want to contribute to [Actionsflow](https://github.com/actionsflow/actionsflow)!

# Documentation Contributions

> I appreciate that you want to contribute to the docs! I have to say that I'm not a native English speaker, so maybe there are some sentences that don’t make a lot of sense. I really appreciate help improving the documentation on the project!

When working on the Actionsflow documentation, you can choose between two major styles of working:

- Work directly in the [GitHub UI](https://github.com/actionsflow/actionsflow/tree/main/docs) using the “Edit this File” functionality and commit capabilities without having to clone the repository (i.e. download the code to your computer). This is useful for quick documentation updates, typo fixes, and lightweight Markdown changes.
- Clone the [Actionsflow](https://github.com/actionsflow/actionsflow) repo.

Some tips:

- If you need to link to the internal docs while editing files inside the `docs` folder, you should always use a relative link, like `./about.md`. That way the scripts that build the [documentation site](https://actionsflow.github.io/docs/) will include the correct links.
- We use [remark lint](https://github.com/remarkjs/remark-lint) as our markdown document linter. The config is [here](https://github.com/actionsflow/actionsflow/blob/main/.remarkrc.js). Running `npm run lint:docs` will check the documentation for issues. Note that documentation is automatically linted before you commit.

# Code Contributions

Actionsflow is written in [Typescript](https://www.typescriptlang.org/) so you should use it in your contributions.

## Directory Structure

Actionsflow is split up in different modules which are all inside a single mono repository.

The most important directories are:

- `/packages` - The different Actionsflow modules.
- `/packages/actionsflow` - Core code which builds workflows and handles triggers.
- `/packages/actionsflow-core` - Core code which provides core utils and interface.
- `/examples` - Workflows examples.
- `/examples/actionsflow-workflow-example` - Example workflow.

## Setup

1. Fork the [repository](https://github.com/actionsflow/actionsflow) and clone it so you have the code in your machine.

   ```bash
   # You should replace the repository URL with your fork
   git clone https://github.com/actionsflow/actionsflow.git
   ```

1. Go into the repository folder:

   ```bash
   cd actionsflow
   ```

1. Install & Bootstrap:

   ```bash
   npm run bootstrap
   ```

1. Start and watch codes changes:

   ```bash
   npm run start
   ```

### Test

You can run tests like this:

```bash
npm run test
```

# Run example workflows

Build all `examples/actionsflow-workflow-example` workflows:

> If you need to build all workflow files, you should create a `.env` file inside the `examples/actionsflow-workflow-example` directory with the following content (some workflow files depend on these secrets):
> `JSON_SECRETS='{"IFTTT_KEY":"place your ifttt webhook key","TELEGRAM_BOT_TOKEN":"place your telegram bot token"}'`

```bash
npm run build:example
```

Or you can build a specific workflow file:

```bash
npm run build:example -- -i rss.yml
```

Run `act` to run workflows locally (you should install [act](https://github.com/nektos/act) first):

```bash
npm run act:example
```

Clean build files and cache:

```bash
npm run clean:example
```

## Development Cycle

While iterating on Actionsflow module code, you can run `npm run start`. It will then
automatically rebuild your code after every change you make.

1.  Start Actionsflow in development mode: `npm run start`
1.  Hack, hack, hack!
1.  Create tests.
1.  Run all tests: `npm run test`
1.  Commit code and create a pull request (you can use `npm run cm` to commit - this will create a [semantic commit](https://github.com/streamich/git-cz)).

## Create a Trigger

It's really easy to create a trigger for Actionsflow. You can find detailed instructions [here](./creating-triggers.md).

## Publish Package

> Note: This section is only for maintenance.

We publish packages with Github actions automatically. If you are ready to publish a package, just run this on the `main` branch:

```bash
npm run release
```

By default, Lerna will prompt for a new version number. The default version number will be a patch update, like `1.0.1` to `1.0.2`.

You can specify the version like this:

```bash
npm run release -- prepatch
# update current prepatch
npm run release -- prerelease
```

Once the workflow is finished, it will update the `actionsflow-action` and `actionsflow-workflow-deafult` dependencies.
