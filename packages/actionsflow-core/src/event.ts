import {
  ITriggerEvent,
  ITriggerContext,
  IWebhookRequestRawPayload,
  HTTP_METHODS_LOWERCASE,
  IWebhookRequestPayload,
  AnyObject,
} from "./interface";
import querystring from "querystring";
import typeis from "type-is";
import { IncomingMessage } from "http";
import { WEBHOOK_DEFAULT_HOST, jsonTypes, formTypes } from "./constans";
import { URL } from "url";
export const formatRequest = ({
  path,
  method,
  headers,
  body,
}: {
  path: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string | AnyObject | undefined;
}): IWebhookRequestPayload => {
  const pathInstance = new URL(path, WEBHOOK_DEFAULT_HOST);
  const querystringStr = pathInstance.search
    ? pathInstance.search.slice(1)
    : "";
  let finalMethod: HTTP_METHODS_LOWERCASE = "get";
  if (method) {
    finalMethod = method.toLowerCase() as HTTP_METHODS_LOWERCASE;
  }
  const request: IWebhookRequestPayload = {
    path: pathInstance.pathname,
    method: finalMethod,
    headers: headers || {},
    originPath: path,
    query: querystring.parse(querystringStr),
    querystring: querystringStr,
    search: pathInstance.search,
    searchParams: pathInstance.searchParams,
    URL: pathInstance,
  };
  if (body) {
    request.body = body;
  }
  return request;
};
export const getEventByContext = (context: ITriggerContext): ITriggerEvent => {
  const triggerEvent: ITriggerEvent = {
    type: "manual",
  };
  const githubObj = context.github;
  const isWebhookEvent =
    githubObj.event_name === "repository_dispatch" &&
    githubObj.event.action === "webhook";
  // is valid webhook event

  if (isWebhookEvent) {
    // valid client body
    const clientPayload =
      (githubObj.event.client_payload as IWebhookRequestRawPayload) || {};
    // get path
    triggerEvent.type = "webhook";
    if (!clientPayload.path) {
      clientPayload.path = "/";
    }
    if (!clientPayload.method) {
      if (clientPayload.body) {
        clientPayload.method = "post";
      } else {
        clientPayload.method = "get";
      }
    }
    if (!clientPayload.headers) {
      clientPayload.headers = {};
    }
    // format clientPayload

    clientPayload.method = clientPayload.method.toLowerCase() as HTTP_METHODS_LOWERCASE;
    if (!clientPayload.path.startsWith("/")) {
      clientPayload.path = `/${clientPayload.path}`;
    }
    // format body

    if (clientPayload.body && typeof clientPayload.body === "string") {
      if (typeis(clientPayload as IncomingMessage, jsonTypes)) {
        clientPayload.body = JSON.parse(clientPayload.body);
      }

      if (typeis(clientPayload as IncomingMessage, formTypes)) {
        clientPayload.body = querystring.parse(clientPayload.body as string);
      }

      // try json
      try {
        clientPayload.body = JSON.parse(clientPayload.body as string);
      } catch (error) {
        // do nothing
      }
    }
    if (clientPayload.headers) {
      // lower case headers
      const newHeaders: Record<string, string> = {};
      const headersKeys = Object.keys(clientPayload.headers);
      headersKeys.forEach((key) => {
        newHeaders[key.toLowerCase()] = (clientPayload.headers as Record<
          string,
          string
        >)[key];
      });
      clientPayload.headers = newHeaders;
    }

    // parse path

    triggerEvent.request = formatRequest({
      path: clientPayload.path,
      method: clientPayload.method,
      headers: clientPayload.headers,
      body: clientPayload.body,
    });
  } else if (githubObj.event_name === "schedule") {
    triggerEvent.type = "schedule";
  } else if (githubObj.event_name === "repository_dispatch") {
    triggerEvent.type = "repository_dispatch";
  } else {
    // manual
    triggerEvent.type = "manual";
  }
  return triggerEvent;
};
