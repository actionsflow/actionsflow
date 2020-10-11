#!/usr/bin/env node
const exec = require("exec-sh").promise;
const fs = require("fs-extra");
const releaseFlagFileName = `.releaseflag`;
const yargs = require(`yargs`);
let argv = yargs.argv;

async function main() {
  let lernaCmd = `npx lerna publish from-package `;
  const releaseFlag = await fs.readFile(releaseFlagFileName, "utf-8");
  if (!releaseFlag) {
    throw new Error(
      `Cannot get a valid version flag from ${releaseFlagFileName}`
    );
  }
  if (releaseFlag.startsWith("pre")) {
    lernaCmd += `--dist-tag beta`;
  }
  if (process.env.CI === "true" || argv.yes || argv.ci) {
    lernaCmd += " --yes";
  }
  await run(lernaCmd);
}

async function run(cmd) {
  // eslint-disable-next-line no-console
  console.log("Start to run: ", cmd);
  try {
    const { stderr } = await exec(cmd);
    if (stderr) {
      console.error(`Error occurred executing ${cmd}:\n`, stderr);
    } else {
      // eslint-disable-next-line no-console
      console.log(`Success executing ${cmd}`);
    }
  } catch (e) {
    throw e;
  }
}

main().catch((e) => {
  console.error(e);
});
