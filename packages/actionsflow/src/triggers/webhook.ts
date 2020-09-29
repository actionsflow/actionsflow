import {
  ITriggerClassType,
  ITriggerContructorParams,
  IWebhook,
  AnyObject,
  IWebhookRequest,
  ITriggerOptions,
  IHelpers,
} from "actionsflow-core";

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
    // TODO adapt every cases
    const deduplicationKey = this.options.deduplicationKey;
    if (deduplicationKey) {
      return item[deduplicationKey as string] as string;
    }
    if (item.id) return item.id as string;
    if (item.key) return item.key as string;
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
