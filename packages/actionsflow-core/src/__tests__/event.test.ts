import { getEventByContext } from "../event";

test("get event by context", () => {
  const context = {
    github: {
      event_name: "repository_dispatch",
      event: {
        action: "webhook",
        client_payload: {
          path: "/telegram-bot/telegram_bot/webhook?test=1",
          body: '{"update_id":"test"}',
        },
      },
    },
    secrets: {},
  };
  const event = getEventByContext(context);

  expect(event.type).toEqual("webhook");
  if (event.request) {
    expect(event.request.path).toBe("/telegram-bot/telegram_bot/webhook");
    if (typeof event.request.body === "object") {
      expect(event.request.body.update_id).toBe("test");
    }
    expect(event.request.query.test).toBe("1");
  }
});
