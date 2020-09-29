import { AnyObject } from "actionsflow-core";

export default class Parser {
  parseURL(): { items: AnyObject[] } {
    return {
      items: [
        {
          title: "test",
          guid: "https://news.ycombinator.com/item?id=24227340",
        },
        {
          title: "test2",
          guid: "https://news.ycombinator.com/item?id=24224882",
        },
      ],
    };
  }
}
