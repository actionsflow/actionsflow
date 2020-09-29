export const TRIGGER_RESULT_ENV_PREFIX = "ACTIONSFLOW_TRIGGER_RESULT_FOR_";
export const WEBHOOK_DEFAULT_HOST = "https://webhook.actionsflow.io";
// default json types
export const jsonTypes = [
  "application/json",
  "application/json-patch+json",
  "application/vnd.api+json",
  "application/csp-report",
];

// default form types
export const formTypes = ["application/x-www-form-urlencoded"];

// default text types
export const textTypes = ["text/plain"];

// default xml types
export const xmlTypes = ["text/xml", "application/xml"];
export const BINARY_ENCODING = "base64";
export const EXCLUDE_INJECT_GIHTUB_ENV = [
  // "GITHUB_WORKFLOW",
  // "GITHUB_RUN_ID",
  // "GITHUB_RUN_NUMBER",
  // "GITHUB_ACTION",
  // "GITHUB_ACTIONS",
  // "GITHUB_ACTOR",
  // "GITHUB_REPOSITORY",
  "GITHUB_EVENT_NAME",
  "GITHUB_EVENT_PATH",
  "GITHUB_WORKSPACE",
  // "GITHUB_SHA",
  // "GITHUB_REF",
  // "GITHUB_TOKEN",
];
