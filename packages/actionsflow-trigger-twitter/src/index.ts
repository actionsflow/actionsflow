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
  event = "user_timeline";
  getItemKey(item: AnyObject): string {
    if (this.event && item.id_str) {
      return (this.event + "__" + item.id_str) as string;
    }
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
    const { event } = this.options as {
      event: string;
    };
    if (event) {
      this.event = event;
    }
    let finalResult: AnyObject[] = [];
    const twitter = new Twit({
      consumer_key,
      consumer_secret,
      access_token,
      access_token_secret,
    });
    if (this.event === "user_timeline") {
      // get cache with since_id
      const since_id = (await this.helpers.cache.get(
        `${this.event}_since_id`
      )) as string | undefined;
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
        this.helpers.cache.set(`${this.event}_since_id`, max_id);
      }
      finalResult = tweets;
    }

    return finalResult;
  }
}
