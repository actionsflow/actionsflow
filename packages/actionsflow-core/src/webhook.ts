import {
  IWebhookHandler,
  IWebhook,
  IWebhookRequest,
  IWorkflow,
  ITrigger,
  AnyObject,
  IWebhookRequestPayload,
} from "./interface";
import { match, Match } from "path-to-regexp";
import { formatRequest } from "./event";
import { getTriggerWebhookBasePath } from "./utils";
import { log } from "./log";
interface IWebhookMatchedResult {
  request: IWebhookRequest;
  handler: IWebhookHandler;
  getItemKey?: (item: AnyObject) => string;
}
export const getWebhookByRequest = ({
  webhooks,
  request,
  workflow,
  trigger,
}: {
  webhooks: IWebhook[];
  request: IWebhookRequestPayload;
  workflow: IWorkflow;
  trigger: ITrigger;
}): IWebhookMatchedResult | undefined => {
  const requestOriginPath = request.originPath;
  const requestMethod = request.method;
  const webhookBasePath = getTriggerWebhookBasePath(
    workflow.relativePath,
    trigger.name
  );
  if (requestOriginPath.startsWith(webhookBasePath)) {
    let requestPathWithoutWebhookBasePathname = request.path.slice(
      webhookBasePath.length
    );
    if (!requestPathWithoutWebhookBasePathname.startsWith("/")) {
      requestPathWithoutWebhookBasePathname = `/${requestPathWithoutWebhookBasePathname}`;
    }
    let requestPathWithoutWebhookBasePath = requestOriginPath.slice(
      webhookBasePath.length
    );
    if (!requestPathWithoutWebhookBasePath.startsWith("/")) {
      requestPathWithoutWebhookBasePath = `/${requestPathWithoutWebhookBasePath}`;
    }
    let matchedWebhook: IWebhookMatchedResult | undefined;
    // lookup webhook handler
    webhooks.forEach((webhook) => {
      let isMethodMatched = false;
      if (webhook.method) {
        let methods: string[] = [];
        if (Array.isArray(webhook.method)) {
          methods = webhook.method;
        } else {
          methods = [webhook.method];
        }

        if (methods.length > 0) {
          isMethodMatched = methods
            .map((method) => method.toLowerCase())
            .includes(requestMethod);
        } else {
          isMethodMatched = true;
        }
      } else {
        // not define method
        isMethodMatched = true;
      }
      let isMatchedPath = false;
      // eslint-disable-next-line @typescript-eslint/ban-types
      let matchResult: Match<object> | undefined;
      if (webhook.path) {
        // regex path
        const matchFn = match(webhook.path, { decode: decodeURIComponent });

        matchResult = matchFn(requestPathWithoutWebhookBasePathname);

        if (matchResult) {
          isMatchedPath = true;
        }
      } else {
        isMatchedPath = true;
      }

      if (isMethodMatched && isMatchedPath) {
        const newRequest: IWebhookRequest = {
          ...formatRequest({
            path: requestPathWithoutWebhookBasePath,
            method: request.method,
            headers: request.headers,
            body: request.body,
          }),
          params: matchResult ? (matchResult.params as AnyObject) : {},
        };

        matchedWebhook = {
          handler: webhook.handler,
          request: newRequest,
        };
        if (webhook.getItemKey) {
          matchedWebhook.getItemKey = webhook.getItemKey;
        }
      }
    });
    if (matchedWebhook) {
      return matchedWebhook;
    } else {
      log.debug(
        `not found any webhooks matched for request path ${requestOriginPath}`
      );
      return;
    }
  } else {
    log.warn(
      `can not found matched webhook handler for request path ${requestOriginPath}`
    );
    return;
  }
};
