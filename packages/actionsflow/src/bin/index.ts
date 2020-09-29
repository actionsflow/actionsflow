#!/usr/bin/env node
import "./inject-cli";
import "@babel/polyfill";
import semver from "semver";
import util from "util";
import { createCli } from "./create-cli";
import pkg from "../../package.json";
import updateNotifier from "update-notifier";
import { log } from "actionsflow-core";
// Check if update is available
updateNotifier({ pkg }).notify({ isGlobal: true });

const MIN_NODE_VERSION = `10.13.0`;

const { version } = process;

if (
  !semver.satisfies(version, `>=${MIN_NODE_VERSION}`, {
    includePrerelease: true,
  })
) {
  console.warn(`
      Actionsflow requires Node.js ${MIN_NODE_VERSION} or higher (you have ${version}).
      Upgrade Node to the latest stable release
    `);
}

if (semver.prerelease(version)) {
  console.warn(`
    You are currently using a prerelease version of Node (${version}), which is not supported.
    You can use this for testing, but we do not recommend it in production.
    Before reporting any bugs, please test with a supported version of Node (>=${MIN_NODE_VERSION}).`);
}

process.on(`unhandledRejection`, (reason) => {
  // This will exit the process in newer Node anyway so lets be consistent
  // across versions and crash

  // reason can be anything, it can be a message, an object, ANYTHING!
  // we convert it to an error object so we don't crash on structured error validation
  if (!(reason instanceof Error)) {
    reason = new Error(util.format(reason));
  }

  console.warn(`UNHANDLED REJECTION`, reason);
});

process.on(`uncaughtException`, (error) => {
  console.warn(`UNHANDLED EXCEPTION`, error);
});

createCli(process.argv.slice(2).join(" ")).catch((err) => {
  // do nothing
  log.error(err);
  process.exit(1);
});
