# `@actionsflow/trigger-reddit`

This is a [reddit](https://reddit.com/) trigger of [Actionsflow](https://github.com/actionsflow/actionsflow). `reddit` trigger is triggered when new posts or comments of reddit are detected.

> This is an official trigger, you don't need to install it manually.

[View trigger on Github](https://github.com/actionsflow/actionsflow/tree/master/packages/actionsflow-trigger-reddit)

# Usage

We use [Reddit RSS](https://www.reddit.com/wiki/rss) to implement this trigger, so you need to provide a reddit posts or comment URL to watch the reddit updates.

All hot feed:

```yaml
on:
  reddit:
    url: https://reddit.com/hot/
```

New Hot Post in Subreddit:

```yaml
on:
  reddit:
    url: https://reddit.com/r/news/
```

new Post in Subreddit:

```yaml
on:
  reddit:
    url: https://reddit.com/r/news/new/
```

new Post by User:

```yaml
on:
  reddit:
    url: https://reddit.com/user/alienth/
```

The comments on a specific reddit post:

```yaml
on:
  reddit:
    url: https://reddit.com/r/technology/comments/1uc9ro/wearing_a_mind_controlled_exoskeleton_a_paralyzed/
```

A multireddit:

```yaml
on:
  reddit:
    url: https://reddit.com/r/WTF+news
```

Multiple reddit:

```yaml
on:
  reddit:
    url:
      - https://reddit.com/user/alienth/
      - https://reddit.com/r/news/
    config:
      limit: 15
```

Or, you can use the full RSS URL:

```yaml
on:
  reddit:
    url: https://reddit.com/r/news/.rss
```

## Options

- `url`, required, `string` or `string[]`, when `url` is `string[]`, then multiple Reddit feeds can trigger the action. All [reddit URL supported `.rss` suffix](https://www.reddit.com/wiki/rss) is valid value.

> You can use [General Config for Actionsflow Trigger](https://actionsflow.github.io/docs/workflow/#ontriggerconfig) for more customization.

## Outputs

Actionsflow use [rss-parser](https://github.com/rbren/rss-parser) for parse RSS file, the outputs are same as [rss-parser](https://github.com/rbren/rss-parser)

An outputs example:

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
    url: https://reddit.com/r/news/
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
