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
      return this.options.url + "__" + key;
    }
    return this.helpers.createContentDigest(item);
  }
  constructor({ helpers, options }: ITriggerContructorParams) {
    this.options = options;
    this.helpers = helpers;
  }
  async run(): Promise<AnyObject[]> {
    const { url, itemsPath, requestConfig } = this.options as {
      url?: string;
      itemsPath?: string;
      deduplicationKey?: string;
      requestConfig?: AnyObject;
    };

    if (!url) {
      throw new Error("Miss param url!");
    }
    const items: AnyObject[] = [];
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
      const itemsArray: AnyObject[] = itemsPath
        ? get(requestResult.data, itemsPath)
        : requestResult.data;
      if (!Array.isArray(itemsArray)) {
        throw new Error("Can not found a valid items result");
      }
      const deepClonedData = clonedeep(itemsArray);
      itemsArray.forEach((item) => {
        if (this.options.shouldIncludeRawBody) {
          item.raw__body = deepClonedData;
        }
        items.push(item);
      });
    }

    // if need
    return items;
  }
}
