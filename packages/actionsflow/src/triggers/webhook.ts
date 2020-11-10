import {
  ITriggerClassType,
  ITriggerContructorParams,
  IWebhook,
  AnyObject,
  IWebhookRequest,
  ITriggerOptions,
  IHelpers,
} from "actionsflow-core";
import get from "lodash.get";

export default class Webhook implements ITriggerClassType {
  options: ITriggerOptions = {};
  helpers: IHelpers;
  constructor({ options, helpers }: ITriggerContructorParams) {
    this.options = options;
    this.helpers = helpers;
    if (this.options.path) {
      this.webhooks[0].path = this.options.path as string;
    }
    if (this.options.method) {
      this.webhooks[0].method = this.options.method as string;
    }
  }
  getItemKey(item: AnyObject): string {
    if (item.request_id) return item.request_id as string;
    return this.helpers.createContentDigest(item);
  }
  _getBodyKey(item: AnyObject): string {
    let key = "";
    const deduplicationKey = this.options.deduplicationKey;
    if (deduplicationKey) {
      key = get(item, deduplicationKey as string) as string;
      if (!key) {
        throw new Error("Can not get deduplicationKey from item");
      }
    } else if (item.id) {
      key = item.id as string;
    } else if (item.key) {
      key = item.key as string;
    }

    if (key) {
      return key;
    }
    return this.helpers.createContentDigest(item);
  }
  webhooks: IWebhook[] = [
    {
      handler: (request: IWebhookRequest): AnyObject[] => {
        const id = this._getBodyKey((request.body as AnyObject) || {});
        return [
          {
            request_id: id,
            body: request.body,
            headers: request.headers,
            method: request.method,
            query: request.query,
            querystring: request.querystring,
            search: request.search,
            params: request.params,
          },
        ];
      },
    },
  ];
}
