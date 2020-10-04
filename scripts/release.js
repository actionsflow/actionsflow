#!/usr/bin/env node
const exec = require("exec-sh").promise;
const yargs = require(`yargs`);
const fs = require("fs-extra");
const releaseFlagFileName = `.releaseflag`;
let argv = yargs.argv;
const version = argv._[0] || "";

async function main() {
  let lernaCmd = `npm run lerna -- version`;
  if (!version) {
    throw new Error(
      "You must specific a version, like prepatch, patch, minor, major, prerelease"
    );
  }
  await fs.writeFile(releaseFlagFileName, version);
  // git add
  await run(`git add ${releaseFlagFileName}`);
  await run(
    `git diff-index --quiet HEAD || git commit -m "chore: add release flag file" ${releaseFlagFileName}`
  );
  const releaseFlag = await fs.readFile(releaseFlagFileName, "utf-8");
  if (!releaseFlag) {
    throw new Error(
      `Cannot get a valid version flag from ${releaseFlagFileName}`
    );
  }
  if (releaseFlag) {
    lernaCmd += ` ${releaseFlag}`;
  }
  if (process.env.CI === "true" || argv.yes || argv.ci) {
    lernaCmd += " --yes";
  }
  await run(lernaCmd);

  let releaseCmd = `npm run release-it --`;
  if (releaseFlag) {
    releaseCmd += ` ${releaseFlag}`;
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
