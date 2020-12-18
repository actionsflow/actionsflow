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
class ResponseError extends Error {
  data: string;
  constructor(data: string) {
    super("response error");
    this.name = "ResponseError";
    this.data = data;
  }
}
export default class Graphql implements ITriggerClassType {
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
    const {
      url,
      itemsPath = "data.items",
      requestConfig = {},
      headers,
      query,
      variables,
    } = this.options as {
      url?: string;
      itemsPath?: string;
      deduplicationKey?: string;
      requestConfig?: AnyObject;
      query?: string;
      variables?: AnyObject;
      headers?: AnyObject;
    };

    if (!url) {
      throw new Error("Miss param url!");
    }
    if (!query) {
      throw new Error("Miss param query!");
    }
    const items: AnyObject[] = [];
    const config: AxiosRequestConfig = {
      method: "POST",
      ...requestConfig,
      headers: {
        ...headers,
      },
      data: {
        query: query,
        variables: variables || {},
      },
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

      this.helpers.log.error(`Graphql fetch ${url} error: `, e);
      throw e;
    }

    if (
      requestResult &&
      requestResult.data &&
      requestResult.data.errors &&
      requestResult.data.errors.length > 0
    ) {
      throw new ResponseError(JSON.stringify(requestResult.data));
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
