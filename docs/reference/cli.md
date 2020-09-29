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
Usage: actionsflow <command> [options]

Commands:
  actionsflow build  Build a Actionsflow workflows.
  actionsflow clean  Wipe the local actionsflow environment including built assets and cache

Options:
  --verbose      Turn on verbose output                                                                                                                                       [boolean] [default: false]
  -h, --help     Show help                                                                                                                                                                     [boolean]
  -v, --version  Show the version of the Actionsflow CLI and the Actionsflow package in the current project                                                                                    [boolean]
```

# Commands

## build

Build Actionsflow workflow files to standard Github actions workflow files

```bash
actionsflow build

Build a Actionsflow workflows.

Options:
  --verbose      Turn on verbose output                                                                                                                                       [boolean] [default: false]
  --dest, -d     workflows build dest path                                                                                                                                  [string] [default: "./dist"]
  --cwd          current workspace path                                                                                                       [string] [default: <your current workspace folder>]
  --include, -i  workflow files that should include, you can use <glob> patterns                                                                                                   [array] [default: []]
  --exclude, -e  workflow files that should exclude, you can use <glob> patterns                                                                                                   [array] [default: []]
  --force, -f    force update all triggers, it will ignore the update interval and cached deduplicate key                                                                                      [boolean]
  -h, --help     Show help                                                                                                                                                                     [boolean]
  -v, --version  Show the version of the Actionsflow CLI and the Actionsflow package in the current project                                                                                    [boolean]
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
  -v, --version  Show the version of the Actionsflow CLI and the Actionsflow package in the current project                                                                                    [boolean]
```
