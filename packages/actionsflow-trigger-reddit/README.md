# `@actionsflow/trigger-reddit`

This is a [reddit](https://reddit.com/) trigger of [Actionsflow](https://github.com/actionsflow/actionsflow). `reddit` trigger is triggered when new posts or comments of reddit are detected.

> This is an official trigger, you don't need to install it manually.

[View trigger on Github](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-reddit)

# Usage

We use [Reddit RSS](https://www.reddit.com/wiki/rss) to implement this trigger, so you need to provide a reddit posts or comment URL to watch the reddit updates.

All hot feed:

```yaml
on:
  reddit:
    url: https://www.reddit.com/hot/
```

New Hot Post in Subreddit:

```yaml
on:
  reddit:
    url: https://www.reddit.com/r/news/
```

new Post in Subreddit:

```yaml
on:
  reddit:
    url: https://www.reddit.com/r/news/new/
```

new Post by User:

```yaml
on:
  reddit:
    url: https://www.reddit.com/user/alienth/
```

The comments on a specific reddit post:

```yaml
on:
  reddit:
    url: https://www.reddit.com/r/technology/comments/1uc9ro/wearing_a_mind_controlled_exoskeleton_a_paralyzed/
```

A multireddit:

```yaml
on:
  reddit:
    url: https://www.reddit.com/r/WTF+news
```

Multiple reddit:

```yaml
on:
  reddit:
    url:
      - https://www.reddit.com/user/alienth/
      - https://www.reddit.com/r/news/
    config:
      limit: 15
```

Or, you can use the full RSS URL:

```yaml
on:
  reddit:
    url: https://www.reddit.com/r/news/.rss
```

## Options

- `url`, required, `string` or `string[]`, when `url` is `string[]`, then multiple Reddit feeds can trigger the action. All [reddit URL supported `.rss` suffix](https://www.reddit.com/wiki/rss) is valid value.
- `source`, optional, `rss` or `json`, the default value is `rss`, if `source` is `rss`, we'll use <https://www.reddit.com/hot/.rss> as the source, if `source` is `json`, we'll use <https://www.reddit.com/hot/.json> as the source
- `client`, optional, `axios` or `puppeteer-fetch`, only works when `source` is `json`, the default value is `axios`
- `sleep`, optional, default sleep time ms, only works when `source` is `json`, the default value is `2000`
- `requestConfig`, optional, if `source` is `json`, you can provide a request config for [Axios](https://github.com/axios/axios) or [puppeteer-fetch](https://github.com/theowenyoung/puppeteer-fetch) config

> You can use [General Config for Actionsflow Trigger](https://actionsflow.github.io/docs/workflow/#ontriggerconfig) for more customization.

## Outputs

### RSS Source Outputs

By default, we use [rss-parser](https://github.com/rbren/rss-parser) for parse RSS file, the outputs are same as [rss-parser](https://github.com/rbren/rss-parser)

A default RSS outputs example:

```json
{
  "title": "Kentucky lawmaker, sponsor of 'Breonna's Law,' back on protest line after arrest",
  "link": "https://www.reddit.com/r/news/comments/j08qih/kentucky_lawmaker_sponsor_of_breonnas_law_back_on/",
  "pubDate": "2020-09-26T16:09:25.000Z",
  "author": "/u/PotaTribune",
  "content": "&#32; submitted by &#32; <a href=\"https://www.reddit.com/user/PotaTribune\"> /u/PotaTribune </a> <br/> <span><a href=\"https://www.nbcnews.com/news/us-news/kentucky-lawmaker-sponsor-breonna-s-law-back-protest-line-after-n1241173\">[link]</a></span> &#32; <span><a href=\"https://www.reddit.com/r/news/comments/j08qih/kentucky_lawmaker_sponsor_of_breonnas_law_back_on/\">[comments]</a></span>",
  "contentSnippet": "submitted by    /u/PotaTribune  \n [link]   [comments]",
  "id": "t3_j08qih",
  "isoDate": "2020-09-26T16:09:25.000Z"
}
```

You can use the outputs like this:

```yaml
on:
  reddit:
    url: https://www.reddit.com/r/news/
jobs:
  print:
    name: Print
    runs-on: ubuntu-latest
    steps:
      - name: Print Outputs
        env:
          title: ${{on.reddit.outputs.title}}
          contentSnippet: ${{on.reddit.outputs.contentSnippet}}
          link: ${{on.reddit.outputs.link}}
        run: |
          echo title: $title
          echo contentSnippet: $contentSnippet
          echo link: $link
```

### JSON Source Outputs

```json
{
  "approved_at_utc": null,
  "subreddit": "todayilearned",
  "selftext": "",
  "author_fullname": "t2_h1eln",
  "saved": false,
  "mod_reason_title": null,
  "gilded": 0,
  "clicked": false,
  "title": "TIL that elephants are tremendous distance swimmers. They can swim for up to six hours and 25 miles (48km). They are so buoyant that if they tire in the water, they can just rest by floating and will not sink. They can also use their trunk as a snorkel and dive.",
  "link_flair_richtext": [],
  "subreddit_name_prefixed": "r/todayilearned",
  "hidden": false,
  "pwls": 6,
  "link_flair_css_class": null,
  "downs": 0,
  "thumbnail_height": 140,
  "top_awarded_type": null,
  "hide_score": false,
  "name": "t3_jowv2r",
  "quarantine": false,
  "link_flair_text_color": "dark",
  "upvote_ratio": 0.98,
  "author_flair_background_color": null,
  "subreddit_type": "public",
  "ups": 26221,
  "total_awards_received": 19,
  "media_embed": {},
  "thumbnail_width": 140,
  "author_flair_template_id": null,
  "is_original_content": false,
  "user_reports": [],
  "secure_media": null,
  "is_reddit_media_domain": false,
  "is_meta": false,
  "category": null,
  "secure_media_embed": {},
  "link_flair_text": null,
  "can_mod_post": false,
  "score": 26221,
  "approved_by": null,
  "author_premium": false,
  "thumbnail": "https://a.thumbs.redditmedia.com/RU60Z6_dLKVp5tO10NIk30hr6ScY0Lb8sqZJg_HF198.jpg",
  "edited": false,
  "author_flair_css_class": null,
  "author_flair_richtext": [],
  "gildings": {
    "gid_1": 1
  },
  "post_hint": "link",
  "content_categories": null,
  "is_self": false,
  "mod_note": null,
  "created": 1604659565,
  "link_flair_type": "text",
  "wls": 6,
  "removed_by_category": null,
  "banned_by": null,
  "author_flair_type": "text",
  "domain": "wildanimalpark.org",
  "allow_live_comments": true,
  "selftext_html": null,
  "likes": null,
  "suggested_sort": null,
  "banned_at_utc": null,
  "url_overridden_by_dest": "https://www.wildanimalpark.org/can-elephants-swim/",
  "view_count": null,
  "archived": false,
  "no_follow": false,
  "is_crosspostable": true,
  "pinned": false,
  "over_18": false,
  "preview": {
    "images": [
      {
        "source": {
          "url": "https://external-preview.redd.it/8MOy01Lv_qLDv0lt4pdcP8FLxX9-J_SrpA-Y4J7n_GM.jpg?auto=webp&amp;s=ed716ceb9f991838d30e2c9f707d028b8648753a",
          "width": 1628,
          "height": 1628
        },
        "resolutions": [
          {
            "url": "https://external-preview.redd.it/8MOy01Lv_qLDv0lt4pdcP8FLxX9-J_SrpA-Y4J7n_GM.jpg?width=108&amp;crop=smart&amp;auto=webp&amp;s=560432cbbbb38b11be5430e2d6c9a7a00a9e44f3",
            "width": 108,
            "height": 108
          },
          {
            "url": "https://external-preview.redd.it/8MOy01Lv_qLDv0lt4pdcP8FLxX9-J_SrpA-Y4J7n_GM.jpg?width=216&amp;crop=smart&amp;auto=webp&amp;s=c1848e78179a12b7de621f8b770a0ecab59039e6",
            "width": 216,
            "height": 216
          },
          {
            "url": "https://external-preview.redd.it/8MOy01Lv_qLDv0lt4pdcP8FLxX9-J_SrpA-Y4J7n_GM.jpg?width=320&amp;crop=smart&amp;auto=webp&amp;s=dee1c0b8dfe64862381034aef79a528c6c87324f",
            "width": 320,
            "height": 320
          },
          {
            "url": "https://external-preview.redd.it/8MOy01Lv_qLDv0lt4pdcP8FLxX9-J_SrpA-Y4J7n_GM.jpg?width=640&amp;crop=smart&amp;auto=webp&amp;s=bef12ba6f9525fb95dfad51064d6dab6d7d31730",
            "width": 640,
            "height": 640
          },
          {
            "url": "https://external-preview.redd.it/8MOy01Lv_qLDv0lt4pdcP8FLxX9-J_SrpA-Y4J7n_GM.jpg?width=960&amp;crop=smart&amp;auto=webp&amp;s=34a82510942e8c947ccdce4a88071a3fd5ca444a",
            "width": 960,
            "height": 960
          },
          {
            "url": "https://external-preview.redd.it/8MOy01Lv_qLDv0lt4pdcP8FLxX9-J_SrpA-Y4J7n_GM.jpg?width=1080&amp;crop=smart&amp;auto=webp&amp;s=2564140094e81d200fc3b5494efd9072fa3866c6",
            "width": 1080,
            "height": 1080
          }
        ],
        "variants": {},
        "id": "UNJeyllQTIO9CfmcI9gDngsW3pKuJC_lOe1f83HzZAU"
      }
    ],
    "enabled": false
  },
  "all_awardings": [
    {
      "giver_coin_reward": 0,
      "subreddit_id": null,
      "is_new": false,
      "days_of_drip_extension": 0,
      "coin_price": 70,
      "id": "award_b92370bb-b7de-4fb3-9608-c5b4a22f714a",
      "penny_donate": 0,
      "award_sub_type": "GLOBAL",
      "coin_reward": 0,
      "icon_url": "https://i.redd.it/award_images/t5_22cerq/fukjtec638u41_TreeHug.png",
      "days_of_premium": 0,
      "tiers_by_required_awardings": null,
      "resized_icons": [
        {
          "url": "https://preview.redd.it/award_images/t5_22cerq/fukjtec638u41_TreeHug.png?width=16&amp;height=16&amp;auto=webp&amp;s=bbe4efb7b7ea2ecacd9609c937941282019a511f",
          "width": 16,
          "height": 16
        },
        {
          "url": "https://preview.redd.it/award_images/t5_22cerq/fukjtec638u41_TreeHug.png?width=32&amp;height=32&amp;auto=webp&amp;s=7aa65fa1bbd9dd3482e18cae220a6acbbabd6452",
          "width": 32,
          "height": 32
        },
        {
          "url": "https://preview.redd.it/award_images/t5_22cerq/fukjtec638u41_TreeHug.png?width=48&amp;height=48&amp;auto=webp&amp;s=a7b1d9f0629a00bc081d6db45a01c14720841969",
          "width": 48,
          "height": 48
        },
        {
          "url": "https://preview.redd.it/award_images/t5_22cerq/fukjtec638u41_TreeHug.png?width=64&amp;height=64&amp;auto=webp&amp;s=ee0ceaa18ec2902fcb59a89bb93dfb440ce7bcf5",
          "width": 64,
          "height": 64
        },
        {
          "url": "https://preview.redd.it/award_images/t5_22cerq/fukjtec638u41_TreeHug.png?width=128&amp;height=128&amp;auto=webp&amp;s=f3c3ed580426898ffd2df864e1111c957f71adf3",
          "width": 128,
          "height": 128
        }
      ],
      "icon_width": 2048,
      "static_icon_width": 2048,
      "start_date": null,
      "is_enabled": true,
      "awardings_required_to_grant_benefits": null,
      "description": "Show nature some love.",
      "end_date": null,
      "subreddit_coin_reward": 0,
      "count": 1,
      "static_icon_height": 2048,
      "name": "Tree Hug",
      "resized_static_icons": [
        {
          "url": "https://preview.redd.it/award_images/t5_22cerq/fukjtec638u41_TreeHug.png?width=16&amp;height=16&amp;auto=webp&amp;s=bbe4efb7b7ea2ecacd9609c937941282019a511f",
          "width": 16,
          "height": 16
        },
        {
          "url": "https://preview.redd.it/award_images/t5_22cerq/fukjtec638u41_TreeHug.png?width=32&amp;height=32&amp;auto=webp&amp;s=7aa65fa1bbd9dd3482e18cae220a6acbbabd6452",
          "width": 32,
          "height": 32
        },
        {
          "url": "https://preview.redd.it/award_images/t5_22cerq/fukjtec638u41_TreeHug.png?width=48&amp;height=48&amp;auto=webp&amp;s=a7b1d9f0629a00bc081d6db45a01c14720841969",
          "width": 48,
          "height": 48
        },
        {
          "url": "https://preview.redd.it/award_images/t5_22cerq/fukjtec638u41_TreeHug.png?width=64&amp;height=64&amp;auto=webp&amp;s=ee0ceaa18ec2902fcb59a89bb93dfb440ce7bcf5",
          "width": 64,
          "height": 64
        },
        {
          "url": "https://preview.redd.it/award_images/t5_22cerq/fukjtec638u41_TreeHug.png?width=128&amp;height=128&amp;auto=webp&amp;s=f3c3ed580426898ffd2df864e1111c957f71adf3",
          "width": 128,
          "height": 128
        }
      ],
      "icon_format": "PNG",
      "icon_height": 2048,
      "penny_price": 0,
      "award_type": "global",
      "static_icon_url": "https://i.redd.it/award_images/t5_22cerq/fukjtec638u41_TreeHug.png"
    }
  ],
  "awarders": [],
  "media_only": false,
  "can_gild": true,
  "spoiler": false,
  "locked": false,
  "author_flair_text": null,
  "treatment_tags": [],
  "visited": false,
  "removed_by": null,
  "num_reports": null,
  "distinguished": null,
  "subreddit_id": "t5_2qqjc",
  "mod_reason_by": null,
  "removal_reason": null,
  "link_flair_background_color": "",
  "id": "jowv2r",
  "is_robot_indexable": true,
  "report_reasons": null,
  "author": "itsmelen",
  "discussion_type": null,
  "num_comments": 415,
  "send_replies": true,
  "whitelist_status": "all_ads",
  "contest_mode": false,
  "mod_reports": [],
  "author_patreon_flair": false,
  "author_flair_text_color": null,
  "permalink": "/r/todayilearned/comments/jowv2r/til_that_elephants_are_tremendous_distance/",
  "parent_whitelist_status": "all_ads",
  "stickied": false,
  "url": "https://www.wildanimalpark.org/can-elephants-swim/",
  "subreddit_subscribers": 24127304,
  "created_utc": 1604630765,
  "num_crossposts": 3,
  "media": null,
  "is_video": false
}
```

You can use the outputs like this:

```yaml
on:
  reddit:
    url: https://www.reddit.com/r/news/
jobs:
  print:
    name: Print
    runs-on: ubuntu-latest
    steps:
      - name: Print Outputs
        env:
          title: ${{on.reddit.outputs.title}}
          link: ${{on.reddit.outputs.permalink}}
        run: |
          echo title: $title
          echo link: $link
```
