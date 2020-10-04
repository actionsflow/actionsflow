# `@actionsflow/trigger-youtube`

This is a [Youtube](https://youtube.com/) trigger of [Actionsflow](https://github.com/actionsflow/actionsflow). Any new videos in Youtube channel or playlist will trigger the trigger.

> This is an official trigger, you don't need to install it manually.

[View trigger on Github](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-youtube)

## Usage

Single channel:

```yaml
on:
  youtube:
    channel_id: UCnCikd0s4i9KoDtaHPlK-JA
```

Multiple Channels:

```yaml
on:
  youtube:
    channel_id:
      - UCnCikd0s4i9KoDtaHPlK-JA
      - UCseUQK4kC3x2x543nHtGpzw
```

Playlist:

```yaml
on:
  youtube:
    playlist_id: PL99D544ED5B1E58D8
```

Multiple playlist:

```yaml
on:
  youtube:
    playlist_id:
      - PL99D544ED5B1E58D8
      - PL2qc-hH9Ip-SSUaZd_G8IxtecK0WZ-af-
```

Or, Both channel or playlist:

```yaml
on:
  youtube:
    channel_id:
      - UCnCikd0s4i9KoDtaHPlK-JA
      - UCseUQK4kC3x2x543nHtGpzw
    playlist_id:
      - PL99D544ED5B1E58D8
      - PL2qc-hH9Ip-SSUaZd_G8IxtecK0WZ-af-
```

## Options

- `channel_id`, optional, Youtube channel ID, `string` or `string[]`, when `channel_id` is `string[]`, then multiple Youtube channels can trigger the action. You can get it from Youtube channel URL. For example, [`https://www.youtube.com/channel/UCOmHUn--16B90oW2L6FRR3A`](https://www.youtube.com/channel/UCOmHUn--16B90oW2L6FRR3A), `channel_id` is `UCOmHUn--16B90oW2L6FRR3A`

- `playlist_id`, optional, Youtube playlist ID, `string` or `string[]`, when `playlist_id` is `string[]`, then multiple Youtube playlist can trigger the action. You can get it from Youtube playlist URL. For example, [`https://www.youtube.com/playlist?list=PL2qc-hH9Ip-SSUaZd_G8IxtecK0WZ-af-`](https://www.youtube.com/channel/UCOmHUn--16B90oW2L6FRR3A), `playlist_id` is `PL2qc-hH9Ip-SSUaZd_G8IxtecK0WZ-af-`, you can use `playlist_id` and `channel_id` at the same time.

> You can use [General Config for Actionsflow Trigger](https://actionsflow.github.io/docs/workflow/#ontriggerconfig) for more customization.

## Outputs

An outputs example:

```json
{
  "videoId": "vrBr_vrMdLQ",
  "channelId": "UCnCikd0s4i9KoDtaHPlK-JA",
  "title": "Mechanizing the Methodology",
  "link": "https://www.youtube.com/watch?v=vrBr_vrMdLQ",
  "pubDate": "2020-08-18T11:49:59.000Z",
  "author": "Daniel Miessler",
  "id": "yt:video:vrBr_vrMdLQ",
  "isoDate": "2020-08-18T11:49:59.000Z",
  "description": "How to find vulnerabilities while you're doing other things.",
  "thumbnail": {
    "url": "https://i3.ytimg.com/vi/vrBr_vrMdLQ/hqdefault.jpg",
    "width": "480",
    "height": "360"
  },
  "starRating": {
    "count": "10",
    "average": "5.00",
    "min": "1",
    "max": "5"
  },
  "statistics": {
    "views": "89"
  }
}
```

You can use the outputs like this:

```yaml
on:
  youtube:
    channel_id: UCnCikd0s4i9KoDtaHPlK-JA
jobs:
  print:
    name: Print
    runs-on: ubuntu-latest
    steps:
      - name: Print Outputs
        env:
          title: ${{on.youtube.outputs.title}}
          description: ${{on.youtube.outputs.description}}
          link: ${{on.youtube.outputs.link}}
        run: |
          echo title: $title
          echo description: $description
          echo link: $link
```
