module.exports = class Trello {
  constructor() {
    this.webhooks = [
      {
        method: "post",
        handler: (request) => {
          let items = [];
          if (request.body) {
            items.push(request.body);
          }
          return items;
        },
      },
    ];
  }
};
