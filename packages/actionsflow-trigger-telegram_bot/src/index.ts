import {
  ITriggerClassType,
  ITriggerContructorParams,
  AnyObject,
  ITriggerOptions,
  IHelpers,
  IWebhookRequest,
  ITriggerGeneralConfigOptions,
} from "actionsflow-core";

export default class TelegramBot implements ITriggerClassType {
  constructor({ helpers, options }: ITriggerContructorParams) {
    if (options) {
      this.options = options;
    }
    this.helpers = helpers;
    if (this.options.webhook) {
      this.config.skipSchedule = true;
    }
  }
  config: ITriggerGeneralConfigOptions = {};
  options: ITriggerOptions = {};
  helpers: IHelpers;
  getItemKey = (item: AnyObject): string => {
    if (item.update_id) return item.update_id as string;
    return this.helpers.createContentDigest(item);
  };
  webhooks = [
    {
      handler: (request: IWebhookRequest): AnyObject[] => {
        let items: AnyObject[] = [];

        if (request.body && (request.body as AnyObject).update_id) {
          items = this._getItems([request.body as AnyObject]);
        }
        return items;
      },
    },
  ];
  async run(): Promise<AnyObject[]> {
    // if webhook is true, then dont run manual fetch
    if (this.options.webhook) {
      return [];
    }
    const log = this.helpers.log;
    const { token } = this.options as {
      token?: string;
    };

    if (!token) {
      throw new Error("Miss param token!");
    }

    let items: AnyObject[] = [];
    const url = `https://api.telegram.org/bot${token}/getUpdates`;
    const config = {
      url,
    };

    // get updates
    let requestResult;
    try {
      requestResult = await this.helpers.axios(config);
    } catch (e) {
      if (e.code === "ECONNREFUSED") {
        throw new Error(
          `It was not possible to connect to the URL. Please make sure the URL "${url}" it is valid!`
        );
      }

      log.error(`Fetch telegram bot api ${url} error: `, e);
      throw e;
    }

    // For now we just take the items and ignore everything else
    if (
      requestResult &&
      requestResult.data &&
      Array.isArray(requestResult.data.result)
    ) {
      const itemsArray = requestResult.data.result;
      log.debug("telegram updates items:", JSON.stringify(itemsArray, null, 2));
      if (itemsArray) {
        items = this._getItems(itemsArray as AnyObject[]);
      }
    }

    // if need
    return items;
  }
  _getItems(itemsArray: AnyObject[]): AnyObject[] {
    const { event } = this.options as {
      event: string | string[];
    };
    let events: string[] = [];
    if (Array.isArray(event)) {
      events = event;
    } else if (event) {
      events = [event];
    }
    const items: AnyObject[] = [];

    const _messageTypes = [
      "text",
      "animation",
      "audio",
      "channel_chat_created",
      "contact",
      "delete_chat_photo",
      "dice",
      "document",
      "game",
      "group_chat_created",
      "invoice",
      "left_chat_member",
      "location",
      "migrate_from_chat_id",
      "migrate_to_chat_id",
      "new_chat_members",
      "new_chat_photo",
      "new_chat_title",
      "passport_data",
      "photo",
      "pinned_message",
      "poll",
      "sticker",
      "successful_payment",
      "supergroup_chat_created",
      "video",
      "video_note",
      "voice",
    ];

    itemsArray.forEach((item: AnyObject) => {
      const message = (item.message as AnyObject) || item.channel_post;

      // add update_id to message for unique key
      message.update_id = item.update_id as string;
      const messageType = _messageTypes.find((messageType) => {
        return message[messageType];
      });
      if (events.length > 0) {
        if (messageType && events.includes(messageType)) {
          items.push(message);
        }
      } else {
        items.push(message);
      }
    });
    return items;
  }
}
