import {
  ITriggerClassType,
  ITriggerContructorParams,
  IHelpers,
  AnyObject,
  ITriggerOptions,
} from "actionsflow-core";
import packageJson from "package-json";

export default class Npm implements ITriggerClassType {
  options: ITriggerOptions = {};
  helpers: IHelpers;
  config = {
    skipFirst: true,
  };
  getItemKey(item: AnyObject): string {
    if (item.version && item.name) {
      let key = (this.options.registryUrl as string) || "";
      key += ("__" + ((item.name as string) + "__" + item.version)) as string;
      return key;
    }
    return this.helpers.createContentDigest(item);
  }
  constructor({ helpers, options }: ITriggerContructorParams) {
    this.options = options;
    this.helpers = helpers;
  }
  async run(): Promise<AnyObject[]> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { name, config: _, ...restOptions } = this.options as {
      name: string | string[];
      config: AnyObject;
    };
    let names: string[] = [];

    if (Array.isArray(name)) {
      if (name.length === 0) {
        throw new Error("name must be provided one at lease");
      }
      names = name;
    } else {
      if (!name) {
        throw new Error("Miss required param name");
      }
      names = [name];
    }
    const items: AnyObject[] = [];

    for (let index = 0; index < names.length; index++) {
      const packageName = names[index];

      let packageMeta: AnyObject = {};
      try {
        packageMeta = await packageJson(packageName, restOptions);
      } catch (e) {
        this.helpers.log.error(`get [${packageName}] package error: `, e);
        throw e;
      }
      items.push(packageMeta);
    }

    return items;
  }
}
