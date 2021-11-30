import yargs from "yargs";
import { log } from "actionsflow-core";
import build from "../build";
import clean from "../clean";
import { start } from "../start";
export const buildCommandBuilder = (_: yargs.Argv): yargs.Argv =>
  _.option(`dest`, {
    alias: "d",
    type: `string`,
    describe: `workflows build dest path`,
    default: "./dist",
  })
    .option(`cwd`, {
      type: `string`,
      describe: `current workspace path`,
      default: process.cwd(),
    })
    .option(`include`, {
      alias: "i",
      type: "array",
      describe: `workflow files that should include, you can use <glob> patterns`,
      default: [],
    })
    .option(`exclude`, {
      alias: "e",
      type: "array",
      describe: `workflow files that should exclude, you can use <glob> patterns`,
      default: [],
    })
    .option("force", {
      alias: "f",
      type: "boolean",
      describe:
        "force update all triggers, it will ignore the update interval and cached deduplicate key",
    })
    .option(`json-secrets`, {
      type: `string`,
      describe: `secrets context in json format`,
      default: "",
    })
    .option(`json-github`, {
      type: `string`,
      describe: `github context in json format`,
      default: "",
    });
export const startCommandBuilder = (_: yargs.Argv): yargs.Argv =>
  _.option(`interval`, {
    type: `number`,
    describe: `Run cronjob interval`,
    default: 5,
  })
    .option(`watch`, {
      type: `boolean`,
      alias: "w",
      describe: `watch your workflow files change`,
      default: false,
    })
    .option(`port`, {
      alias: "p",
      type: `number`,
      describe: `Port to use`,
      default: 3000,
    })
    .option(`dest`, {
      alias: "d",
      type: `string`,
      describe: `workflows build dest path, the default value is ./dist/.cron/$\{timestamp\}`,
      default: "",
    })
    .option(`cwd`, {
      type: `string`,
      describe: `current workspace path`,
      default: process.cwd(),
    })
    .option(`include`, {
      alias: "i",
      type: "array",
      describe: `workflow files that should include, you can use <glob> patterns`,
      default: [],
    })
    .option(`exclude`, {
      alias: "e",
      type: "array",
      describe: `workflow files that should exclude, you can use <glob> patterns`,
      default: [],
    })
    .option("force", {
      alias: "f",
      type: "boolean",
      describe:
        "force update all triggers, it will ignore the update interval and cached deduplicate key",
    })
    .option(`json-secrets`, {
      type: `string`,
      describe: `secrets context in json format`,
      default: "",
    })
    .option(`json-github`, {
      type: `string`,
      describe: `github context in json format`,
      default: "",
    });
function buildLocalCommands(cli: yargs.Argv) {
  cli.command({
    command: `build`,
    describe: `Build an Actionsflow workflows.`,
    builder: buildCommandBuilder,
    handler: build as () => Promise<void>,
  });
  cli.command({
    command: `start`,
    describe: `Start an Actionsflow instance.
If you want to pass args to \`act\`, you should pass them after \`--\`, for example: \`actionsflow start -w -- -b\``,
    builder: startCommandBuilder,
    handler: start as () => Promise<void>,
  });

  cli.command({
    command: `clean`,
    describe: `Wipe the local actionsflow environment including built assets and cache`,
    builder: (_) =>
      _.option(`dest`, {
        alias: "d",
        type: `string`,
        describe: `workflows build dest path`,
        default: "./dist",
      }).option(`base`, {
        alias: "b",
        type: `string`,
        describe: `workspace base path`,
        default: process.cwd(),
      }),
    handler: clean,
  });
}

function getVersionInfo() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { version } = require(`../../package.json`);

  return `Actionsflow CLI version: ${version}`;
}
export const createCli = (argv: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const versionInfo = getVersionInfo();
    // eslint-disable-next-line no-console
    console.log(versionInfo + "\n");
    const cli = yargs;
    cli
      .scriptName(`actionsflow`)
      .usage(`Usage: $0 <command> [options]`)
      .alias(`h`, `help`)
      .alias(`v`, `version`)
      .option(`verbose`, {
        default: false,
        type: `boolean`,
        describe: `Turn on verbose output`,
        global: true,
      });

    buildLocalCommands(cli);
    cli.version(
      `version`,
      `Show the version of the Actionsflow CLI and the Actionsflow package in the current project`,
      " "
    );
    cli
      .wrap(cli.terminalWidth())
      .recommendCommands()
      .onFinishCommand((result) => {
        log.debug("finish command");
        return resolve(result);
      })
      .fail((msg, err) => {
        log.debug("fail command");
        if (msg) log.error(msg);
        reject(err);
      });
    const cliArgv = cli.parse(argv);
    if (!cliArgv._[0]) {
      cli.showHelp();
      return resolve("");
    }
  });
};
