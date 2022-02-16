import { log, IStartOptions } from "actionsflow-core";
import Koa from "koa";
import Router from "@koa/router";
import cors from "@koa/cors";
import helmet from "koa-helmet";
import bodyParser from "koa-bodyparser";
import {
  defaultResponseCode,
  defaultResponseContentType,
  defaultResponseBody,
} from "./constans";
import runJob from "./run-workflows";

export const start = async (options: IStartOptions): Promise<void> => {
  const app = new Koa();
  // Provides important security headers to make your app more secure
  app.use(helmet());
  // Enable cors with default options
  app.use(cors());
  // Middlewares
  app.use(bodyParser());
  const router = new Router();
  router.all("/webhook/(.*)", async (ctx) => {
    const request = {
      method: ctx.method,
      path: ctx.params[0] + ctx.search,
      headers: ctx.headers,
      body: ctx.request.body,
    };
    log.debug("raw request", request);
    // https://github.com/actionsflow/actionsflow/issues/34
    // JSON_GITHUB webhook payload
    const newOptions = {
      ...options,
    };
    newOptions.jsonGithub = JSON.stringify({
      event_name: "repository_dispatch",
      event: {
        action: "webhook",
        client_payload: request,
      },
    });
    // run workflows
    runJob(newOptions).catch((e) => {
      log.warn("run workflows error: ", e);
    });
    const searchParams = new URLSearchParams(ctx.search);
    let responseCode: string | number | null = searchParams.get(
      "__response_code"
    );
    if (!responseCode) {
      responseCode = defaultResponseCode;
    }

    const responseContentType =
      searchParams.get("__response_content_type") || defaultResponseContentType;
    const finalStatus = Number(responseCode);
    const searchParamsResponseBody = searchParams.get("__response_body");
    let responseBody: string | null = defaultResponseBody;
    if (searchParamsResponseBody) {
      responseBody = searchParamsResponseBody;
    }
    ctx.status = finalStatus;
    ctx.set("Content-Type", responseContentType);
    ctx.body = responseBody;
  });
  // Routes
  app.use(router.routes()).use(router.allowedMethods());
  const port = options.port || 3000;
  app.listen(port, () => {
    log.info(`Start server at http://localhost:${port}`);
    log.info(`Listen webhook endpoint at http://localhost:${port}/webhook/`);
  });
};
