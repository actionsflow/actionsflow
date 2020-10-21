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
  fetchAllResultsAtFirst = false;
  maxCount = Infinity;
  isFirstRun = false;
  getItemKey(item: AnyObject): string {
    if (this.api && item.id_str) {
      return (this.api + "__" + item.id_str) as string;
    }
    return this.helpers.createContentDigest(item);
  }
  constructor({ helpers, options, context }: ITriggerContructorParams) {
    this.options = options;
    this.options.auth = this.options.auth || {};
    this.options.params = (this.options.params as AnyObject) || {};
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
    let since_id = (await this.helpers.cache.get(`${this.api}_since_id`)) as
      | string
      | undefined;
    if (this.options.config && this.options.config.force) {
      since_id = undefined;
    }
    let max_id = "";

    const optionParams = this.options.params as AnyObject;
    let params = optionParams;
    if (this.api === "statuses/user_timeline") {
      // get screen_name
      if (this.fetchAllResultsAtFirst && this.isFirstRun && !params.count) {
        params.count = 200;
      }
      params = {
        screen_name: "",
        exclude_replies: true,
        include_rts: true,
        tweet_mode: "extended",
        since_id,
        count: 20,
        ...params,
      };
    }
    let fetchNextResults = true;
    let tweets: AnyObject[] = [];

    while (fetchNextResults) {
      this.helpers.log.debug(`twitter api ${this.api} params: `, params);
      const result = await twitter.get(this.api, params);
      this.helpers.log.debug(`twitter api ${this.api} result: `, result.data);
      let latestTweets: AnyObject[] = [];
      if (["search/tweets"].includes(this.api)) {
        if (result.data && (result.data as AnyObject).statuses) {
          latestTweets = (result.data as AnyObject).statuses as AnyObject[];
        }
      } else {
        latestTweets = result.data as AnyObject[];
      }
      // concat tweets
      if (latestTweets.length > 0) {
        tweets = tweets.concat(latestTweets);
      }
      if (
        this.api === "statuses/user_timeline" &&
        this.fetchAllResultsAtFirst &&
        latestTweets.length &&
        this.maxCount > tweets.length
      ) {
        const maxId = decrementHugeNumberBy1(
          tweets[tweets.length - 1].id_str as string
        );
        params = {
          ...params,
          max_id: maxId,
        };
      } else {
        fetchNextResults = false;
      }
    }
    tweets = tweets.slice(0, this.maxCount);
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
      await this.helpers.cache.set(`${this.api}_since_id`, max_id);
    }
    return finalResult;
  }
}
function trimLeft(s: string, c: string): string {
  let i = 0;
  while (i < s.length && s[i] === c) {
    i++;
  }

  return s.substring(i);
}
function decrementHugeNumberBy1(n: string | number): string {
  // make sure s is a string, as we can't do math on numbers over a certain size
  n = n.toString();
  const allButLast = n.substr(0, n.length - 1);
  const lastNumber = n.substr(n.length - 1);

  if (lastNumber === "0") {
    return decrementHugeNumberBy1(allButLast) + "9";
  } else {
    const finalResult = allButLast + (parseInt(lastNumber, 10) - 1).toString();
    return trimLeft(finalResult, "0");
  }
}
