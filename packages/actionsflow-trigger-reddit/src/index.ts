import {
  ITriggerClassType,
  ITriggerContructorParams,
  IHelpers,
  AnyObject,
  ITriggerOptions,
} from "actionsflow-core";

export default class Reddit implements ITriggerClassType {
  options: ITriggerOptions = {};
  helpers: IHelpers;
  source = "rss";
  getItemKey(item: AnyObject): string {
    // TODO adapt every cases
    if (item.guid) return item.guid as string;
    if (item.link) return item.link as string;
    if (item.permalink) return item.permalink as string;
    if (item.id) return item.id as string;
    return this.helpers.createContentDigest(item);
  }
  constructor({ helpers, options }: ITriggerContructorParams) {
    this.options = options;
    this.helpers = helpers;
    if (options.source) {
      this.source = options.source as string;
    }
  }
  async requestJSON(urls: string[], config?: AnyObject): Promise<AnyObject[]> {
    urls = urls.map((item) => {
      const urlObj = new URL(item);
      if (urlObj.pathname.endsWith(".json")) {
        return item;
      } else {
        urlObj.pathname = `${urlObj.pathname}.json`;
        return urlObj.toString();
      }
    });
    const items: AnyObject[] = [];
    config = {
      ...config,
    };
    for (let index = 0; index < urls.length; index++) {
      const feedUrl = urls[index];
      this.helpers.log.debug("reddit request options:", feedUrl, config);
      const result = await this.helpers.axios.get(feedUrl, config);
      this.helpers.log.debug(
        "reddit request response:",
        result.status,
        result.data
      );
      if (
        result &&
        result.data &&
        result.data.data &&
        result.data.data.children
      ) {
        return result.data.data.children.map((item: AnyObject) => item.data);
      }
    }
    return items;
  }
  formatItem(item: AnyObject): AnyObject {
    return item;
  }
  async requestRSS(urls: string[]): Promise<AnyObject[]> {
    urls = urls.map((item) => {
      const urlObj = new URL(item);
      if (urlObj.pathname.endsWith(".rss")) {
        return item;
      } else {
        urlObj.pathname = `${urlObj.pathname}.rss`;
        return urlObj.toString();
      }
    });
    const items: AnyObject[] = [];

    for (let index = 0; index < urls.length; index++) {
      const feedUrl = urls[index];
      // get updates
      const parser = new this.helpers.rssParser();

      let feed;
      try {
        feed = await parser.parseURL(feedUrl);
      } catch (e) {
        if (e.code === "ECONNREFUSED") {
          throw new Error(
            `It was not possible to connect to the URL. Please make sure the URL "${feedUrl}" it is valid!`
          );
        }

        this.helpers.log.error(`Fetch reddit rss feed [${feedUrl}] error: `, e);
        throw e;
      }
      // For now we just take the items and ignore everything else
      if (feed && feed.items) {
        feed.items.forEach((item) => {
          items.push(this.formatItem(item));
        });
      }
    }
    return items;
  }
  async run(): Promise<AnyObject[]> {
    const { url } = this.options as {
      url: string | string[];
    };

    let urls: string[] = [];

    if (Array.isArray(url)) {
      if (url.length === 0) {
        throw new Error("url must be provided one at lease");
      }
      urls = url;
    } else {
      if (!url) {
        throw new Error("Miss required param url");
      }
      urls = [url];
    }
    let items: AnyObject[] = [];
    if (this.source === "json") {
      items = await this.requestJSON(
        urls,
        this.options.requestConfig as AnyObject
      );
    } else {
      items = await this.requestRSS(urls);
    }
    // if need
    return items;
  }
}
