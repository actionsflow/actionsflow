import {
  ITriggerClassType,
  ITriggerContructorParams,
  IHelpers,
  AnyObject,
  ITriggerOptions,
} from "actionsflow-core";

export default class Youtube implements ITriggerClassType {
  options: ITriggerOptions = {};
  helpers: IHelpers;
  getItemKey(item: AnyObject): string {
    // TODO adapt every cases
    if (item.guid) return item.guid as string;
    if (item.link) return item.link as string;
    if (item.id) return item.id as string;
    return this.helpers.createContentDigest(item);
  }
  constructor({ helpers, options }: ITriggerContructorParams) {
    this.options = options;
    this.helpers = helpers;
  }

  async run(): Promise<AnyObject[]> {
    const { channel_id } = this.options as { channel_id: string | string[] };
    let channels: string[] = [];

    if (Array.isArray(channel_id)) {
      channels = channel_id;
    } else if (channel_id) {
      channels = [channel_id];
    }
    const { playlist_id } = this.options as { playlist_id: string | string[] };
    let playlists: string[] = [];

    if (Array.isArray(playlist_id)) {
      playlists = playlist_id;
    } else if (playlist_id) {
      playlists = [playlist_id];
    }
    const channelRssUrls = channels.map((channelId) => {
      return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    });
    const playlistUrls = playlists.map((playlistId) => {
      return `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;
    });
    const urls: string[] = channelRssUrls.concat(playlistUrls);
    if (urls.length <= 0) {
      throw new Error("Miss required param channel or playlist");
    }
    const items: AnyObject[] = [];

    for (let index = 0; index < urls.length; index++) {
      const feedUrl = urls[index];
      // get updates
      const parser = new this.helpers.rssParser({
        customFields: {
          feed: [],
          item: [
            ["yt:videoId", "videoId"],
            ["yt:channelId", "channelId"],
            [
              "media:group",
              "mediaGroup",
              {
                keepArray: true,
              },
            ],
          ],
        },
      });

      let feed;
      try {
        feed = await parser.parseURL(feedUrl);
      } catch (e) {
        if (e.code === "ECONNREFUSED") {
          throw new Error(
            `It was not possible to connect to the URL. Please make sure the URL "${feedUrl}" it is valid!`
          );
        }

        this.helpers.log.error(
          `Fetch youtube rss feed [${feedUrl}] error: `,
          e
        );
        throw e;
      }
      // For now we just take the items and ignore everything else
      if (feed && feed.items) {
        ((feed.items as unknown) as AnyObject[]).forEach((feedItem) => {
          const newItem = formatItem(feedItem);
          items.push(newItem);
        });
      }
    }

    // if need
    return items;
  }
}
function formatItem(theItem: AnyObject): AnyObject {
  const mediaGroups = theItem.mediaGroup;
  delete theItem.mediaGroup;
  if (mediaGroups && (mediaGroups as AnyObject[])[0]) {
    const mediaGroup = (mediaGroups as AnyObject[])[0];
    if (
      mediaGroup &&
      mediaGroup["media:description"] &&
      (mediaGroup["media:description"] as string[]).length > 0
    ) {
      theItem.description = (mediaGroup["media:description"] as string[])[0];
    }

    if (
      mediaGroup &&
      mediaGroup["media:thumbnail"] &&
      (mediaGroup["media:thumbnail"] as AnyObject[]).length > 0
    ) {
      if ((mediaGroup["media:thumbnail"] as AnyObject[])[0].$) {
        theItem.thumbnail = (mediaGroup["media:thumbnail"] as AnyObject[])[0].$;
      }
    }

    if (
      mediaGroup &&
      mediaGroup["media:community"] &&
      (mediaGroup["media:community"] as AnyObject[]).length > 0
    ) {
      if (
        (mediaGroup["media:community"] as AnyObject[])[0]["media:starRating"] &&
        ((mediaGroup["media:community"] as AnyObject[])[0][
          "media:starRating"
        ] as AnyObject[]).length > 0
      ) {
        theItem.starRating = ((mediaGroup["media:community"] as AnyObject[])[0][
          "media:starRating"
        ] as AnyObject[])[0].$;
      }

      if (
        (mediaGroup["media:community"] as AnyObject[])[0]["media:statistics"] &&
        ((mediaGroup["media:community"] as AnyObject[])[0][
          "media:statistics"
        ] as AnyObject[]).length > 0
      ) {
        theItem.statistics = ((mediaGroup["media:community"] as AnyObject[])[0][
          "media:statistics"
        ] as AnyObject[])[0].$;
      }
    }
  }
  return theItem;
}
