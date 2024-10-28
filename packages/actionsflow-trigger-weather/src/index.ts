import {
  ITriggerClassType,
  ITriggerContructorParams,
  IHelpers,
  AnyObject,
  ITriggerOptions,
  ITriggerGeneralConfigOptions,
} from "actionsflow-core";
export default class Weather implements ITriggerClassType {
  config: ITriggerGeneralConfigOptions = {
    shouldDeduplicate: false,
  };
  options: ITriggerOptions = {};
  helpers: IHelpers;
  api = "onecall";
  apiKey = "";
  endpoint = "https://api.openweathermap.org/data/3.0/";
  getItemKey(item: AnyObject): string {
    if (this.endpoint && this.api) {
      return (this.endpoint + this.api + "__" + Date.now()) as string;
    }
    if (item) {
      item.__timestamp = Date.now();
    }
    return this.helpers.createContentDigest(item);
  }
  constructor({ helpers, options }: ITriggerContructorParams) {
    this.options = options;
    this.options.params = (this.options.params as AnyObject) || {};
    this.helpers = helpers;
    this.apiKey = options.apiKey as string;

    if (options.every) {
      this.config.every = options.every as string;
    }
    if (options.timeZone) {
      this.config.timeZone = options.timeZone as string;
    }
    if (options.filter) {
      this.config.filter = options.filter as AnyObject;
    }
    if (options.api) {
      this.api = options.api as string;
    }
    if (options.endpoint) {
      this.endpoint = options.endpoint as string;
    }
  }
  async request(): Promise<AnyObject> {
    if (!this.apiKey) {
      throw new Error("Miss param apiKey");
    }
    if (Object.keys(this.options.params as AnyObject).length === 0) {
      throw new Error("The params should not be empty");
    }
    const url = `${this.endpoint}${this.api}?appid=${this.apiKey}`;
    const config = {
      params: this.options.params,
    };
    this.helpers.log.debug("weather request options:", url, config);
    const result = await this.helpers.axios.get(url, config);
    this.helpers.log.debug(
      "weather request response:",
      result.status,
      result.data
    );
    return result.data;
  }

  async run(): Promise<AnyObject[]> {
    const finalResult = [await this.request()];
    return finalResult;
  }
}
