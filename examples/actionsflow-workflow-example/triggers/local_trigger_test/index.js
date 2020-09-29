module.exports = class Example {
  getItemKey(item) {
    if (item.id) return item.id;
    return this.helpers.createContentDigest(item);
  }
  constructor({ helpers, options }) {
    this.options = options;
    this.helpers = helpers;
  }
  async run() {
    const items = [
      {
        id: "uniqueId",
        title: "hello world title",
      },
      {
        id: "uniqueId2",
        title: "hello world title2",
      },
    ];
    return {
      items,
    };
  }
};
