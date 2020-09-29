# `@actionsflow/trigger-npm`

This is an [npm](https://npmjs.com/) trigger of [Actionsflow](https://github.com/actionsflow/actionsflow). Any new version of some package in [NPM](https://www.npmjs.com/) will trigger the trigger.

> This is an official trigger, you don't need to install it manually.

[View trigger on Github](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-npm)

## Usage

```yaml
on:
  npm:
    name: actionsflow
```

## Options

- `name`, required, `string` or `string[]`, when `name` is `string[]`, then multiple npm package version updates can trigger the action.

You can pass all options supported by [`package-json`](https://github.com/sindresorhus/package-json).

> You can use [General Config for Actionsflow Trigger](https://actionsflow.github.io/docs/workflow/#ontriggerconfig) for more customization.

## Outputs

This trigger's outputs will be the meta of the package.

An outputs example:

```json
{
  "name": "actionsflow",
  "version": "0.3.12",
  "dependencies": {
    "@actions/github": "^4.0.0",
    "@actionsflow/trigger-aws_sns": "^0.1.45",
    "@actionsflow/trigger-google_form": "^0.1.6",
    "@actionsflow/trigger-reddit": "^0.1.41",
    "@actionsflow/trigger-slack": "^0.1.46",
    "@actionsflow/trigger-telegram_bot": "^0.1.46",
    "@actionsflow/trigger-trello": "^0.1.6",
    "@actionsflow/trigger-twitter": "^0.1.43",
    "@actionsflow/trigger-typeform": "^0.1.45",
    "@babel/polyfill": "^7.11.5",
    "@octokit/core": "^3.1.2",
    "@types/fs-extra": "^9.0.1",
    "@types/imap-simple": "^4.2.3",
    "@types/js-yaml": "^3.12.5",
    "@types/lodash.clonedeep": "^4.5.6",
    "@types/lodash.get": "^4.4.6",
    "@types/mailparser": "^2.7.3",
    "@types/semver": "^7.3.4",
    "@types/update-notifier": "^4.1.1",
    "@types/xml2js": "^0.4.5",
    "actionsflow-core": "^0.1.43",
    "del": "^5.1.0",
    "dotenv": "^8.2.0",
    "fs-extra": "^9.0.1",
    "imap-simple": "^5.0.0",
    "js-yaml": "^3.14.0",
    "lodash": "^4.17.20",
    "lodash.clonedeep": "^4.5.0",
    "lodash.get": "^4.4.2",
    "loglevel": "^1.6.8",
    "mailparser": "^3.0.0",
    "resolve-cwd": "^3.0.0",
    "semver": "^7.3.2",
    "update-notifier": "^4.1.0",
    "yargs": "^15.4.1"
  },
  "bin": { "actionsflow": "cli.js" },
  "engines": { "node": ">=10.4" }
}
```

You can use the outputs like this:

```yaml
on:
  npm:
    name: actionsflow
jobs:
  print:
    name: Print
    runs-on: ubuntu-latest
    steps:
      - name: Print Outputs
        env:
          version: ${{ on.npm.outputs.version) }}
        run: |
          echo version: $version
```
