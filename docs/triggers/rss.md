---
title: "RSS"
metaTitle: "Actionsflow RSS trigger"
metaDescription: "RSS trigger is triggered when new item are detected. This trigger supports one or multiple RSS sources"
---

RSS trigger is triggered when new item are detected. Both single feed and multiple feeds are supported for RSS trigger.

[View trigger on Github](https://github.com/actionsflow/actionsflow/blob/main/packages/actionsflow/src/triggers/rss.ts)

# Usage

Single feed:

```yaml
on:
  rss:
    url: https://hnrss.org/newest?points=300
```

Multiple feeds:

```yaml
on:
  rss:
    url:
      - https://hnrss.org/newest?points=300
      - https://www.buzzfeed.com/world.xml
    config:
      limit: 15
```

## Options

- `url`, required, `string` or `string[]`, when `url` is `string[]`, then multiple RSS feeds can trigger the action.
- `parserConfig`, optional, `object`, you can pass the [rss-parse](https://github.com/rbren/rss-parser#xml-options) params to here.

> You can use [General Config for Actionsflow Trigger](../workflow.md#ontriggerconfig) for more customization.

## Outputs

Actionsflow use [rss-parser](https://github.com/rbren/rss-parser) for parse RSS file, the outputs are same as [rss-parser](https://github.com/rbren/rss-parser)

An outputs example:

```json
{
  "title": "The water is too deep, so he improvises",
  "link": "https://www.reddit.com/r/funny/comments/3skxqc/the_water_is_too_deep_so_he_improvises/",
  "pubDate": "Thu, 12 Nov 2015 21:16:39 +0000",
  "content": "<table> <tr><td> <a href=\"https://www.reddit.com/r/funny/comments/3skxqc/the_water_is_too_deep_so_he_improvises/\"><img src=\"https://b.thumbs.redditmedia.com/z4zzFBqZ54WT-rFfKXVor4EraZtJVw7AodDvOZ7kitQ.jpg\" alt=\"The water is too deep, so he improvises\" title=\"The water is too deep, so he improvises\" /></a> </td><td> submitted by <a href=\"https://www.reddit.com/user/cakebeerandmorebeer\"> cakebeerandmorebeer </a> to <a href=\"https://www.reddit.com/r/funny/\"> funny</a> <br/> <a href=\"http://i.imgur.com/U407R75.gifv\">[link]</a> <a href=\"https://www.reddit.com/r/funny/comments/3skxqc/the_water_is_too_deep_so_he_improvises/\">[275 comments]</a> </td></tr></table>",
  "contentSnippet": "submitted by  cakebeerandmorebeer  to  funny \n [link] [275 comments]",
  "guid": "https://www.reddit.com/r/funny/comments/3skxqc/the_water_is_too_deep_so_he_improvises/",
  "categories": ["funny"],
  "isoDate": "2015-11-12T21:16:39.000Z"
}
```

You can use the outputs like this:

```yaml
on:
  rss:
    url: https://hnrss.org/newest?points=300
jobs:
  print:
    name: Print
    runs-on: ubuntu-latest
    steps:
      - name: Print Outputs
        env:
          title: ${{on.rss.outputs.title}}
          contentSnippet: ${{on.rss.outputs.contentSnippet}}
          link: ${{on.rss.outputs.link}}
        run: |
          echo title: $title
          echo contentSnippet: $contentSnippet
          echo link: $link
```
