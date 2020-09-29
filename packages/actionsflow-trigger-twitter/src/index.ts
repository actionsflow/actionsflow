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
  getItemKey(item: AnyObject): string {
    if (item.id_str) return item.id_str as string;
    return this.helpers.createContentDigest(item);
  }
  constructor({ helpers, options }: ITriggerContructorParams) {
    this.options = options;
    this.options.auth = this.options.auth || {};
    this.options.query = (this.options.query as AnyObject) || {};
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
    let { event } = this.options as {
      event: string;
    };
    if (!event) {
      event = "user_timeline";
    }
    let finalResult: AnyObject[] = [];
    const twitter = new Twit({
      consumer_key,
      consumer_secret,
      access_token,
      access_token_secret,
    });
    if (event === "user_timeline") {
      // get cache with since_id
      const since_id = (await this.helpers.cache.get(`${event}_since_id`)) as
        | string
        | undefined;
      // get screen_name
      const optionParams = this.options.query as AnyObject;
      const params = {
        screen_name: "",
        count: 50,
        exclude_replies: true,
        include_rts: true,
        tweet_mode: "extended",
        since_id,
        ...optionParams,
      };
      const result = await twitter.get("statuses/user_timeline", params);
      const tweets = result.data as AnyObject[];
      let max_id = "";
      if (tweets.length > 0) {
        tweets.sort((a, b) => {
          return Number(BigInt(a.id as bigint) - BigInt(b.id as bigint));
        });

        tweets.forEach((tweet) => {
          if (!max_id || BigInt(tweet.id_str) > BigInt(max_id)) {
            max_id = tweet.id_str as string;
          }
        });
      }
      if (max_id) {
        this.helpers.cache.set(`${event}_since_id`, max_id);
      }
      finalResult = tweets;
    }

    return finalResult;
  }
}
