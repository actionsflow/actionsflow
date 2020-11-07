---
title: CLI API
metaTitle: Actionsflow CLI API
---

This document is for [npm Actionsflow package](https://www.npmjs.com/package/actionsflow), you can use `actionsflow` by API or CLI.

Here are the Actionsflow CLI API docs, you can see [API docs at here](../reference/actionsflow-api.md)

# Install

```bash
# You can use Actionsflow by npx
npx actionsflow build

# or, global install actionsflow
npm i actionsflow -g

# or install Actionsflow to your project
npm i actionsflow --save
```

# Usage

```bash
Actionsflow CLI version: 1.6.0

Usage: actionsflow <command> [options]

Commands:
  actionsflow build  Build an Actionsflow workflows.
  actionsflow start  Start an Actionsflow instance.
  actionsflow clean  Wipe the local actionsflow environment including built assets and cache

Options:
  --verbose      Turn on verbose output                                                                                                                                       [boolean] [default: false]
  -h, --help     Show help                                                                                                                                                                     [boolean]
  -v, --version  Show the version of the Actionsflow CLI and the Actionsflow package in the current project                                                                                    [boolean][boolean][boolean]
```

# Commands

## build

Build Actionsflow workflow files to standard Github actions workflow files

```bash
Actionsflow CLI version: 1.6.0

actionsflow build

Build an Actionsflow workflows.

Options:
  --verbose       Turn on verbose output                                                                                                                                            [boolean] [default: false]
  --dest, -d      workflows build dest path                                                                                                                                       [string] [default: "./dist"]
  --cwd           current workspace path                                                                                                            [string] [default: "/Users/owenyoung/project/actionsflow"]
  --include, -i   workflow files that should include, you can use <glob> patterns                                                                                                        [array] [default: []]
  --exclude, -e   workflow files that should exclude, you can use <glob> patterns                                                                                                        [array] [default: []]
  --force, -f     force update all triggers, it will ignore the update interval and cached deduplicate key                                                                                           [boolean]
  --json-secrets  secrets context in json format                                                                                                                                        [string] [default: ""]
  --json-github   github context in json format                                                                                                                                         [string] [default: ""]
  -h, --help      Show help                                                                                                                                                                          [boolean]
  -v, --version   Show the version of the Actionsflow CLI and the Actionsflow package in the current project                                                                                         [boolean][boolean][boolean]
```

## start

Start actionsflow at local

```bash
Actionsflow CLI version: 1.6.0

actionsflow start

Start an Actionsflow instance.

Options:
  --verbose       Turn on verbose output                                                                                                                                            [boolean] [default: false]
  --interval      Run cronjob interval                                                                                                                                                   [number] [default: 5]
  --watch, -w     watch your workflow files change                                                                                                                                  [boolean] [default: false]
  --port, -p      Port to use                                                                                                                                                            [number] [default: 5]
  --dest, -d      workflows build dest path, the default value is ./dist/.cron/${timestamp}                                                                                             [string] [default: ""]
  --cwd           current workspace path                                                                                                            [string] [default: "/Users/owenyoung/project/actionsflow"]
  --include, -i   workflow files that should include, you can use <glob> patterns                                                                                                        [array] [default: []]
  --exclude, -e   workflow files that should exclude, you can use <glob> patterns                                                                                                        [array] [default: []]
  --force, -f     force update all triggers, it will ignore the update interval and cached deduplicate key                                                                                           [boolean]
  --json-secrets  secrets context in json format                                                                                                                                        [string] [default: ""]
  --json-github   github context in json format                                                                                                                                         [string] [default: ""]
  -h, --help      Show help                                                                                                                                                                          [boolean]
  -v, --version   Show the version of the Actionsflow CLI and the Actionsflow package in the current project                                                                                         [boolean]
```

> Note: If you want to pass args to `act`, you should pass them after `--`, for example:

```bash
actionsflow start -w -- -b
```

## clean

Clean the dist folder and cache

```bash
actionsflow clean

Wipe the local actionsflow environment including built assets and cache

Options:
  --verbose      Turn on verbose output                                                                                                                                       [boolean] [default: false]
  --dest, -d     workflows build dest path                                                                                                                                  [string] [default: "./dist"]
  --base, -b     workspace base path                                                                                                          [string] [default: "/Users/owenyoung/project/actionsflow"]
  -h, --help     Show help                                                                                                                                                                     [boolean]
  -v, --version  Show the version of the Actionsflow CLI and the Actionsflow package in the current project                                                                                    [boolean]                                                                                [boolean]
```
