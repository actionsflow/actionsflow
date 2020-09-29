import path from "path";
import yaml from "js-yaml";
import fs from "fs-extra";
import { log } from "./log";
import { IWorkflowData, IGithub } from "./interface";
import { EXCLUDE_INJECT_GIHTUB_ENV } from "./constans";
export const buildNativeEvent = async (options: {
  dest: string;
  github: IGithub;
}): Promise<{ path: string; eventJson: string }> => {
  const baseDest = options.dest;
  const github = options.github;
  const destWorkflowEventPath = path.resolve(baseDest, "event.json");
  let eventJson = "{}";
  if (!github.event) {
    github.event = {};
  }
  eventJson = JSON.stringify(github.event, null, 2);
  await fs.outputFile(destWorkflowEventPath, eventJson);
  log.debug("build event file success", destWorkflowEventPath);

  return {
    path: destWorkflowEventPath,
    eventJson: eventJson,
  };
};
export const buildNativeSecrets = async (options: {
  dest: string;
  secrets: Record<string, string>;
}): Promise<{ path: string; secrets: string }> => {
  const baseDest = options.dest;
  const secretsObj = options.secrets;

  const destWorkflowSecretsPath = path.resolve(baseDest, ".secrets");
  let secrets = "";
  Object.keys(secretsObj).forEach((key) => {
    secrets += key + "=" + secretsObj[key] + "\n";
  });
  await fs.outputFile(destWorkflowSecretsPath, secrets);
  log.debug("build secrets file success", destWorkflowSecretsPath);
  return {
    path: destWorkflowSecretsPath,
    secrets: secrets,
  };
};

export const buildNativeEnv = async (options: {
  dest: string;
}): Promise<{ path: string; env: string }> => {
  const baseDest = options.dest;
  const allEnv = process.env;
  const injectEnv: Record<string, string | undefined> = {};
  Object.keys(allEnv).forEach((key) => {
    if (key.startsWith("ACTIONS_")) {
      injectEnv[key] = allEnv[key];
    }
    if (key.startsWith("GITHUB_")) {
      if (!EXCLUDE_INJECT_GIHTUB_ENV.includes(key)) {
        injectEnv[key] = allEnv[key];
      }
    }
  });
  const destWorkflowEnvPath = path.resolve(baseDest, ".env");
  let env = "";
  Object.keys(injectEnv).forEach((key) => {
    env += key + "=" + injectEnv[key] + "\n";
  });
  log.debug("inject env", injectEnv);
  await fs.outputFile(destWorkflowEnvPath, env);
  log.debug("build env file success", destWorkflowEnvPath);
  return {
    path: destWorkflowEnvPath,
    env: env,
  };
};

export const buildWorkflowFile = async ({
  workflowData,
  dest,
}: {
  workflowData: IWorkflowData;
  dest: string;
}): Promise<{ path: string; workflowContent: string }> => {
  const workflowContent = yaml.safeDump(workflowData);
  log.debug("generate workflow file: ", dest);
  await fs.outputFile(dest, workflowContent);
  return {
    path: dest,
    workflowContent: workflowContent,
  };
};
