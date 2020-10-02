---
title: Package actionsflow API
metaTitle: Actionsflow Package actionsflow API
---

This document is for [npm Actionsflow package](https://www.npmjs.com/package/actionsflow), you can use `actionsflow` by API or CLI.

Here is the Actionsflow core API docs, you can see [CLI docs at here](../reference/cli.md)

# Install

```bash
npm i actionsflow --save

# or

yarn add actionsflow
```

# build

Build Actionsflow workflow files to standard Github actions workflow files

```typescript
import { build } from "actionsflow";

function build(options: {
  cwd?: string; // base root workspace folder, default is process.cwd()
  dest?: string; // dest folder, the default value is 'dist', the standard Github actions workflow files will place to `./dist/workflows`
  include?: string[]; // Include only workflow files with names matching the given glob.
  exclude?: string[]; // Exclude workflow files with names matching the given glob.
  force?: boolean; // if force the trigger update, ignore the deduplicate key and update interval
  logLevel?: LogLevelDesc; // Log level, default is "info", you can use one of these values, "trace" | "debug" | "info" | "warn" | "error" | "silent"
}): Promise<void>;
```

# clean

Clean the dist folder and cache

```typescript
import { clean } from "actionsflow";

function clean (options: {
  dest?: string; // dest folder, the default value is 'dist'
  cwd?: string; // base workspace folder, default is process.cwd()
  logLevel?: Log.LogLevelDesc; // Log level, default is "info", you can use one of these values, "trace" | "debug" | "info" | "warn" | "error" | "silent"
}): Promise<void>;
};
```
