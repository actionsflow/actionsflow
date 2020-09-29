#!/usr/bin/env node
const exec = require("exec-sh").promise;
const yargs = require(`yargs`);
let argv = yargs.argv;
const version = argv._[0] || "";

async function main() {
  let lernaCmd = `npm run lerna -- version`;
  if (version) {
    lernaCmd += ` ${version}`;
  }
  if (process.env.CI === "true" || argv.yes || argv.ci) {
    lernaCmd += " --yes";
  }
  await run(lernaCmd);

  let releaseCmd = `npm run release-it --`;
  if (version) {
    releaseCmd += ` ${version}`;
  }
  if (process.env.CI === "true" || argv.yes || argv.ci) {
    releaseCmd += " --ci";
  }
  releaseCmd += " --only-version";
  await run(releaseCmd);
}

async function run(cmd) {
  try {
    const { stderr } = await exec(cmd);
    if (stderr) {
      console.error(`Error occurred executing ${cmd}:\n`, stderr);
    } else {
      console.log(`Success executing ${cmd}`);
    }
  } catch (e) {
    throw e;
  }
}

main().catch((e) => {
  console.error(e);
});
