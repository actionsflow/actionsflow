# `@actionsflow/trigger-twitter`

This is a twitter trigger of [Actionsflow](https://github.com/actionsflow/actionsflow). You can watch yours or the other twitter user's updates by using this trigger.

> This is an official trigger, you don't need to install it manually.

[View trigger on Github](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-twitter)

# Usage

```yaml
on:
  twitter:
    api: statuses/user_timeline
    auth:
      consumer_key: ${{ secrets.TWITTER_CONSUMER_KEY }}
      consumer_secret: ${{ secrets.TWITTER_CONSUMER_SECRET }}
      access_token: ${{ secrets.TWITTER_ACCESS_TOKEN }}
      access_token_secret: ${{ secrets.TWITTER_ACCESS_SECRET }}
    params:
      screen_name: theowenyoung
```

## Options

- `api`, optional, default is `statuses/user_timeline`, for now, you can use [`search/tweets`](https://developer.twitter.com/en/docs/twitter-api/v1/tweets/search/api-reference/get-search-tweets), [`statuses/user_timeline`](https://developer.twitter.com/en/docs/twitter-api/v1/tweets/timelines/api-reference/get-statuses-user_timeline), [`statuses/mentions_timeline`](https://developer.twitter.com/en/docs/twitter-api/v1/tweets/timelines/api-reference/get-statuses-mentions_timeline), [`favorites/list`](https://developer.twitter.com/en/docs/twitter-api/v1/tweets/post-and-engage/api-reference/get-favorites-list)

- `auth`, required, twitter API authentication, you should get it from [Twitter Developers App](https://developer.twitter.com/en/apps)

  ```yaml
  auth:
    consumer_key: ${{ secrets.TWITTER_CONSUMER_KEY }}
    consumer_secret: ${{ secrets.TWITTER_CONSUMER_SECRET }}
    access_token: ${{ secrets.TWITTER_ACCESS_TOKEN }}
    access_token_secret: ${{ secrets.TWITTER_ACCESS_SECRET }}
  ```

- `params`, optional, fetch twitter API params, See [`search/tweets`](https://developer.twitter.com/en/docs/twitter-api/v1/tweets/search/api-reference/get-search-tweets), [`statuses/user_timeline`](https://developer.twitter.com/en/docs/twitter-api/v1/tweets/timelines/api-reference/get-statuses-user_timeline), [`statuses/mentions_timeline`](https://developer.twitter.com/en/docs/twitter-api/v1/tweets/timelines/api-reference/get-statuses-mentions_timeline), [`favorites/list`](https://developer.twitter.com/en/docs/twitter-api/v1/tweets/post-and-engage/api-reference/get-favorites-list).

  For `statuses/user_timeline`, you must provide `screen_name` field, for example:

  ```yaml
  params:
    screen_name: theowenyoung
    exclude_replies: true,
    include_rts: true,
    tweet_mode: "extended",
  ```

- `fetchAllResultsAtFirst`, optional, `boolean`, if fetch all results at first run, the default is `false`, if `true`, it will fetch all results of tweet. This is only available when `api` is `statuses/user_timeline`

- `maxCount`, optional, `number`, if `fetchAllResultsAtFirst` is `true`, you can use `maxCount` to limit the number of fetched results, such like `1000`.

> You can use [General Config for Actionsflow Trigger](https://actionsflow.github.io/docs/workflow/#ontriggerconfig) for more customization.

## Outputs

This trigger's outputs will be the item of the following results.

An `statuses/user_timeline` outputs example:

```json
{
  "created_at": "Wed Aug 12 02:01:00 +0000 2020",
  "id": 1293366847476134000,
  "id_str": "1293366847476133888",
  "full_text": "test tweets...",
  "truncated": false,
  "display_text_range": [0, 30],
  "entities": {
    "hashtags": [],
    "symbols": [],
    "user_mentions": [],
    "urls": []
  },
  "source": "<a href=\"https://mobile.twitter.com\" rel=\"nofollow\">Twitter Web App</a>",
  "in_reply_to_status_id": null,
  "in_reply_to_status_id_str": null,
  "in_reply_to_user_id": null,
  "in_reply_to_user_id_str": null,
  "in_reply_to_screen_name": null,
  "user": {
    "id": 1241294513575878700,
    "id_str": "1241294513575878656",
    "name": "Owen Young",
    "screen_name": "TheOwenYoung",
    "location": "",
    "description": "love workflows",
    "url": null,
    "entities": {
      "description": {
        "urls": []
      }
    },
    "protected": false,
    "followers_count": 2,
    "friends_count": 52,
    "listed_count": 1,
    "created_at": "Sat Mar 21 09:24:27 +0000 2020",
    "favourites_count": 4,
    "utc_offset": null,
    "time_zone": null,
    "geo_enabled": false,
    "verified": false,
    "statuses_count": 28,
    "lang": null,
    "contributors_enabled": false,
    "is_translator": false,
    "is_translation_enabled": false,
    "profile_background_color": "F5F8FA",
    "profile_background_image_url": null,
    "profile_background_image_url_https": null,
    "profile_background_tile": false,
    "profile_image_url": "http://pbs.twimg.com/profile_images/1241298955742273536/E26HEH2o_normal.jpg",
    "profile_image_url_https": "https://pbs.twimg.com/profile_images/1241298955742273536/E26HEH2o_normal.jpg",
    "profile_link_color": "1DA1F2",
    "profile_sidebar_border_color": "C0DEED",
    "profile_sidebar_fill_color": "DDEEF6",
    "profile_text_color": "333333",
    "profile_use_background_image": true,
    "has_extended_profile": true,
    "default_profile": true,
    "default_profile_image": false,
    "following": false,
    "follow_request_sent": false,
    "notifications": false,
    "translator_type": "none"
  },
  "geo": null,
  "coordinates": null,
  "place": null,
  "contributors": null,
  "is_quote_status": false,
  "retweet_count": 0,
  "favorite_count": 0,
  "favorited": false,
  "retweeted": false,
  "lang": "zh"
}
```

You can use the outputs like this:

```yaml
on:
  twitter:
    api: user_timeline
    auth:
      consumer_key: ${{ secrets.TWITTER_CONSUMER_KEY }}
      consumer_secret: ${{ secrets.TWITTER_CONSUMER_SECRET }}
      access_token: ${{ secrets.TWITTER_ACCESS_TOKEN }}
      access_token_secret: ${{ secrets.TWITTER_ACCESS_SECRET }}
    params:
      screen_name: theowenyoung
jobs:
  print:
    name: Print
    runs-on: ubuntu-latest
    steps:
      - name: Print Outputs
        env:
          text: ${{ on.twitter.outputs.full_text }}
        run: |
          echo text: $text
```

> For the other API outputs, please see [`search/tweets`](https://developer.twitter.com/en/docs/twitter-api/v1/tweets/search/api-reference/get-search-tweets), [`statuses/user_timeline`](https://developer.twitter.com/en/docs/twitter-api/v1/tweets/timelines/api-reference/get-statuses-user_timeline), [`statuses/mentions_timeline`](https://developer.twitter.com/en/docs/twitter-api/v1/tweets/timelines/api-reference/get-statuses-mentions_timeline), [`favorites/list`](https://developer.twitter.com/en/docs/twitter-api/v1/tweets/post-and-engage/api-reference/get-favorites-list).
