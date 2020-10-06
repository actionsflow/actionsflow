import { URLSearchParams, URL } from "url";
import { ParsedUrlQuery } from "querystring";
import { Logger, LogLevelDesc } from "loglevel";
import { AxiosStatic } from "axios";
import Parser from "rss-parser";
export type HTTP_METHODS_LOWERCASE =
  | "head"
  | "get"
  | "post"
  | "put"
  | "patch"
  | "delete"
  | "options";
export type GenericValue = string | number | boolean | undefined | null;
export type AnyObject = Record<string, GenericValue | GenericValue[] | unknown>;
export interface IBinaryData {
  [key: string]: string | undefined;
  data: string;
  mimeType: string;
  fileName?: string;
  fileExtension?: string;
}

export interface IGithub extends AnyObject {
  event: AnyObject;
}
export interface IHelpers {
  createContentDigest: (input: unknown) => string;
  formatBinary: (
    content: Buffer,
    filePath?: string,
    mimeType?: string
  ) => Promise<IBinaryData>;
  cache: {
    get: (key: string) => Promise<unknown>;
    set: (key: string, value: unknown) => Promise<unknown>;
    del: (key: string) => Promise<void>;
    reset: () => Promise<void>;
  };
  log: Logger;
  axios: AxiosStatic;
  rssParser: typeof Parser;
}
export interface ITriggerContext {
  secrets: Record<string, string>;
  github: IGithub;
}
export interface IContextEnv {
  JSON_SECRETS: string;
  JSON_GITHUB: string;
}
export interface ITriggerGeneralConfigOptions {
  every?: number;
  shouldDeduplicate?: boolean;
  skipFirst?: boolean;
  force?: boolean;
  logLevel?: LogLevelDesc;
  active?: boolean;
  buildOutputsOnError?: boolean;
  skipOnError?: boolean;
  filter?: AnyObject;
  filterOutputs?: AnyObject;
  format?: string;
  skip?: number;
  limit?: number;
  sort?: AnyObject;
}
export interface ITriggerOptions extends AnyObject {
  config?: ITriggerGeneralConfigOptions;
}

export interface ITriggerContructorParams {
  options: ITriggerOptions;
  helpers: IHelpers;
  workflow: IWorkflow;
}
export interface ITriggerResultObject {
  items: AnyObject[];
}
export type ITriggerResult = AnyObject[] | ITriggerResultObject;
export interface IWebhookRequestRawPayload {
  method?: HTTP_METHODS_LOWERCASE;
  headers?: Record<string, string>;
  path?: string;
  body?: string | AnyObject | undefined;
}
export interface IWebhookRequestPayload {
  method: HTTP_METHODS_LOWERCASE;
  headers: Record<string, string>;
  originPath: string;
  path: string;
  query: ParsedUrlQuery;
  querystring: string;
  search: string;
  body?: string | AnyObject | undefined;
  searchParams: URLSearchParams;
  URL: URL;
}
export interface IWebhookRequest extends IWebhookRequestPayload {
  params: AnyObject;
}
export type IWebhookHandler = (
  request: IWebhookRequest
) => Promise<ITriggerResult> | ITriggerResult;
export interface IWebhook {
  path?: string;
  method?: string | string[];
  getItemKey?: (item: AnyObject) => string;
  handler: IWebhookHandler;
}
export interface ITriggerClassType {
  config?: ITriggerGeneralConfigOptions;
  getItemKey?: (item: AnyObject) => string;
  run?(): Promise<ITriggerResult> | ITriggerResult;
  webhooks?: IWebhook[];
}
export interface ITriggerClassTypeConstructable {
  new (params: ITriggerContructorParams): ITriggerClassType;
}

export interface ITrigger {
  name: string;
  options: ITriggerOptions;
}
export type OutcomeStatus = "success" | "failure" | "skipped";
export type ConclusionStatus = "success" | "failure" | "skipped";
export interface ITriggerBuildResult {
  outputs?: AnyObject;
  outcome: OutcomeStatus;
  conclusion: ConclusionStatus;
}
export interface ITriggerInternalResult {
  items: AnyObject[];
  outcome: OutcomeStatus;
  conclusion: ConclusionStatus;
  helpers?: IHelpers;
}
export interface IWorkflowData {
  on: string[] | null | AnyObject | string;
  jobs?: Record<string, AnyObject>;
  env?: Record<string, string>;
}
export interface IWorkflow {
  path: string;
  relativePath: string;
  data: IWorkflowData;
}

export type TriggerEventType =
  | "manual"
  | "schedule"
  | "webhook"
  | "repository_dispatch";
export interface ITriggerEvent {
  type: TriggerEventType;
  request?: IWebhookRequestPayload;
}
export interface ITaskTrigger extends ITrigger {
  class: ITriggerClassTypeConstructable | undefined;
}

export interface ITask {
  workflow: IWorkflow;
  trigger: ITaskTrigger;
  event: ITriggerEvent;
}

export interface ITriggerError {
  error: Error;
  trigger: ITaskTrigger;
}
