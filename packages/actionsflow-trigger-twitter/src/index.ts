import {
  ITriggerClassType,
  ITriggerContructorParams,
  IHelpers,
  AnyObject,
  ITriggerOptions,
} from "actionsflow-core";
import Twit from "twit";
export default class Twitter implements ITriggerClassType {
  options: ITriggerOptions = {};
  helpers: IHelpers;
  api = "statuses/user_timeline";
  getItemKey(item: AnyObject): string {
    if (this.api && item.id_str) {
      return (this.api + "__" + item.id_str) as string;
    }
    return this.helpers.createContentDigest(item);
  }
  constructor({ helpers, options }: ITriggerContructorParams) {
    this.options = options;
    this.options.auth = this.options.auth || {};
    this.options.params = (this.options.params as AnyObject) || {};
    this.helpers = helpers;
  }

  async run(): Promise<AnyObject[]> {
    const {
      consumer_key,
      consumer_secret,
      access_token,
      access_token_secret,
    } = this.options.auth as {
      consumer_key: string;
      consumer_secret: string;
      access_token: string;
      access_token_secret: string;
    };
    const { api } = this.options as {
      api: string;
    };
    if (api) {
      this.api = api;
    }
    // validate
    const supportedApis: string[] = [
      "search/tweets",
      "statuses/user_timeline",
      "favorites/list",
      "statuses/mentions_timeline",
    ];
    if (!supportedApis.includes(this.api)) {
      throw new Error("Twitter trigger not support ${this.api} api now");
    }
    let finalResult: AnyObject[] = [];
    const twitter = new Twit({
      consumer_key,
      consumer_secret,
      access_token,
      access_token_secret,
    });
    // get cache with since_id
    const since_id = (await this.helpers.cache.get(`${this.api}_since_id`)) as
      | string
      | undefined;
    let max_id = "";

    const optionParams = this.options.params as AnyObject;
    let params = optionParams;
    if (this.api === "statuses/user_timeline") {
      // get screen_name
      params = {
        screen_name: "",
        exclude_replies: true,
        include_rts: true,
        tweet_mode: "extended",
        since_id,
        ...params,
      };
    }
    this.helpers.log.debug(`twitter api ${this.api} params: `, params);
    const result = await twitter.get(this.api, params);
    this.helpers.log.debug(`twitter api ${this.api} result: `, result.data);
    let tweets: AnyObject[] = [];

    if (["search/tweets"].includes(this.api)) {
      if (result.data && (result.data as AnyObject).statuses) {
        tweets = (result.data as AnyObject).statuses as AnyObject[];
      }
    } else {
      tweets = result.data as AnyObject[];
    }

    if (tweets.length > 0) {
      tweets.sort((a, b) => {
        return Number(BigInt(b.id as bigint) - BigInt(a.id as bigint));
      });
      tweets.forEach((tweet) => {
        if (!max_id || BigInt(tweet.id_str) > BigInt(max_id)) {
          max_id = tweet.id_str as string;
        }
      });
    }

    finalResult = tweets;
    if (max_id) {
      this.helpers.cache.set(`${this.api}_since_id`, max_id);
    }
    return finalResult;
  }
}
