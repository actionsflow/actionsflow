import { AxiosRequestConfig } from "axios";
import clonedeep from "lodash.clonedeep";
import get from "lodash.get";
import {
  ITriggerClassType,
  ITriggerContructorParams,
  IHelpers,
  AnyObject,
  ITriggerOptions,
} from "actionsflow-core";

export default class Poll implements ITriggerClassType {
  options: ITriggerOptions = {};
  helpers: IHelpers;
  getItemKey(item: AnyObject): string {
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
      let requestUrl = this.options.url;
      if (item.___url) {
        requestUrl = item.___url;
      }
      return requestUrl + "__" + key;
    }
    return this.helpers.createContentDigest(item);
  }
  constructor({ helpers, options }: ITriggerContructorParams) {
    this.options = options;
    this.helpers = helpers;
  }
  async run(): Promise<AnyObject[]> {
    const { url: urlParams, itemsPath, requestConfig } = this.options as {
      url?: string | string[];
      itemsPath?: string;
      deduplicationKey?: string;
      requestConfig?: AnyObject;
    };

    let urls: string[] = [];

    if (Array.isArray(urlParams)) {
      if (urlParams.length === 0) {
        throw new Error("url must be provided one at lease");
      }
      urls = urlParams;
    } else {
      if (!urlParams) {
        throw new Error("Miss required param url");
      }
      urls = [urlParams];
    }
    const items: AnyObject[] = [];

    for (let index = 0; index < urls.length; index++) {
      const url = urls[index];
      const config: AxiosRequestConfig = {
        ...requestConfig,
        url: url as string,
      };

      // get updates
      let requestResult;
      try {
        requestResult = await this.helpers.axios(config);
      } catch (e) {
        if (e.code === "ECONNREFUSED") {
          throw new Error(
            `It was not possible to connect to the URL. Please make sure the URL "${url}" it is valid!`
          );
        }

        this.helpers.log.error(`Poll fetch ${url} error: `, e);
        throw e;
      }
      // For now we just take the items and ignore everything else
      if (requestResult && requestResult.data) {
        let itemsArray: AnyObject[] = itemsPath
          ? get(requestResult.data, itemsPath)
          : requestResult.data;
        if (!Array.isArray(itemsArray)) {
          itemsArray = [itemsArray];
        }
        const deepClonedData = clonedeep(itemsArray);
        itemsArray.forEach((item) => {
          if (this.options.shouldIncludeRawBody) {
            item.raw__body = deepClonedData;
          }
          if (this.options.shouldIncludeRequest) {
            item.__request = config;
          }
          if (!item.___url) {
            // for deduplication key
            Object.defineProperty(item, "___url", {
              value: url,
            });
          }

          items.push(item);
        });
      }
    }

    // if need
    return items;
  }
}
