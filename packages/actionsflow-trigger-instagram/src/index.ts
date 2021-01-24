import {
  ITriggerClassType,
  ITriggerContructorParams,
  IHelpers,
  AnyObject,
  ITriggerOptions,
} from "actionsflow-core";
export default class Instagram implements ITriggerClassType {
  options: ITriggerOptions = {};
  helpers: IHelpers;
  fetchAllResultsAtFirst = false;
  maxCount = Infinity;
  isFirstRun = false;
  getItemKey(item: AnyObject): string {
    if (item.id) {
      return item.id as string;
    }
    return this.helpers.createContentDigest(item);
  }
  constructor({ helpers, options, context }: ITriggerContructorParams) {
    this.options = options;
    if (this.options.fetchAllResultsAtFirst) {
      this.fetchAllResultsAtFirst = true;
    }
    if (this.options.maxCount) {
      this.maxCount = this.options.maxCount as number;
    }
    if (context.isFirstRun) {
      this.isFirstRun = true;
    }
    this.helpers = helpers;
  }
  async getMultipleResults(): Promise<AnyObject[]> {
    let finalResult: AnyObject[] = [];
    const the_user_id = (this.options.user_id as AnyObject[]) || [];
    const access_token = (this.options.access_token as string) || "";
    let paramsArr = the_user_id;
    paramsArr = paramsArr.map((user_id) => {
      return {
        limit: 20,
        user_id,
        fields:
          "caption,id,media_type,media_url,permalink,thumbnail_url,timestamp,username",
      };
    });

    let items: AnyObject[] = [];
    for (let i = 0; i < paramsArr.length; i++) {
      const params = paramsArr[i];
      const user_id = params.user_id;
      delete params.user_id;

      const url = `https://graph.instagram.com/${user_id}/media?access_token=${access_token}`;
      this.helpers.log.debug(`instagarm api ${url} params: `, params);
      const requestConfig = {
        url: url,
        params: params,
      };
      this.helpers.log.debug(`instagram api requestConfig: `, requestConfig);
      // get updates
      let requestResult;

      try {
        requestResult = await this.helpers.axios(requestConfig);
      } catch (e) {
        if (e.code === "ECONNREFUSED") {
          throw new Error(
            `It was not possible to connect to the URL. Please make sure the URL "${requestConfig.url}" it is valid!`
          );
        }

        this.helpers.log.error(`Graphql fetch ${requestConfig.url} error: `, e);
        throw e;
      }
      this.helpers.log.debug(
        `instagram api ${requestConfig.url} result: `,
        requestResult
      );

      let itemsArray: AnyObject[] = [];
      // For now we just take the items and ignore everything else
      if (requestResult && requestResult.data && requestResult.data.data) {
        itemsArray = requestResult.data.data;
        if (!Array.isArray(itemsArray)) {
          throw new Error("Can not found a valid items result");
        }
        itemsArray.forEach((item) => {
          items.push(item);
        });
      }
    }

    items = items.slice(0, this.maxCount);

    finalResult = items;

    return finalResult;
  }
  async getSingleResults(): Promise<AnyObject[]> {
    let finalResult: AnyObject[] = [];
    const user_id = (this.options.user_id as string) || "me";
    const access_token = (this.options.access_token as string) || "";
    // get cache with since_id
    let nextUrl = (await this.helpers.cache.get(`${user_id}_next`)) as
      | string
      | undefined;
    if (this.options.config && this.options.config.force) {
      nextUrl = undefined;
    }
    let next = nextUrl;
    const params = {
      limit: 20,
      fields:
        "caption,id,media_type,media_url,permalink,thumbnail_url,timestamp,username",
    };
    // get screen_name
    if (this.fetchAllResultsAtFirst && this.isFirstRun && !this.options.limit) {
      params.limit = 100;
    }

    let fetchNextResults = true;
    let items: AnyObject[] = [];

    while (fetchNextResults) {
      const url = `https://graph.instagram.com/${user_id}/media?access_token=${access_token}`;
      const requestConfig = {
        url: next ? next : url,
        params: params,
      };
      this.helpers.log.debug(`instagram api requestConfig: `, requestConfig);
      // get updates
      let requestResult;

      try {
        requestResult = await this.helpers.axios(requestConfig);
      } catch (e) {
        if (e.code === "ECONNREFUSED") {
          throw new Error(
            `It was not possible to connect to the URL. Please make sure the URL "${requestConfig.url}" it is valid!`
          );
        }

        this.helpers.log.error(`Graphql fetch ${requestConfig.url} error: `, e);
        throw e;
      }
      this.helpers.log.debug(
        `instagram api ${requestConfig.url} result: `,
        requestResult
      );

      let itemsArray: AnyObject[] = [];

      // For now we just take the items and ignore everything else
      if (requestResult && requestResult.data && requestResult.data.data) {
        itemsArray = requestResult.data.data;
        if (!Array.isArray(itemsArray)) {
          throw new Error("Can not found a valid items result");
        }
        itemsArray.forEach((item) => {
          items.push(item);
        });
      }
      if (
        this.fetchAllResultsAtFirst &&
        itemsArray.length &&
        this.maxCount > items.length &&
        requestResult.data &&
        requestResult.data.paging &&
        requestResult.data.paging.next
      ) {
        next = requestResult.data.paging.next;
      } else {
        fetchNextResults = false;
      }
    }
    items = items.slice(0, this.maxCount);
    finalResult = items;
    if (next) {
      await this.helpers.cache.set(`${user_id}_next`, next);
    }
    return finalResult;
  }

  async run(): Promise<AnyObject[]> {
    const { access_token, user_id } = this.options as {
      user_id: string;
      access_token: string;
    };
    if (!access_token) {
      throw new Error("Miss required params access_token");
    }
    let finalResult: AnyObject[] = [];

    if (Array.isArray(user_id)) {
      // multiple
      finalResult = await this.getMultipleResults();
    } else {
      finalResult = await this.getSingleResults();
    }

    return finalResult;
  }
}
