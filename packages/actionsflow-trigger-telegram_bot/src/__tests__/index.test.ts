import path from "path";
import TelegramBot from "../index";
import { formatRequest, getTriggerConstructorParams } from "actionsflow-core";
import { AxiosStatic } from "axios";
const TELEGRAM_TOKEN = "test";

test("telegram bot with webhook", async () => {
  const triggerConstructorParams = await getTriggerConstructorParams({
    name: "telegram_bot",
    cwd: path.resolve(__dirname, "fixtures"),
    workflowPath: path.resolve(__dirname, "fixtures/workflows/workflow.yml"),
    options: {
      token: TELEGRAM_TOKEN,
      webhook: true,
    },
  });
  const telegramBot = new TelegramBot(triggerConstructorParams);
  const requestPayload = formatRequest({
    path: "/",
    body: {
      update_id: 791185174,
      message: {
        message_id: 9,
        from: {
          id: 1056059698,
          is_bot: false,
          first_name: "Owen",
          last_name: "Young",
          language_code: "en",
        },
        chat: {
          id: 1056059698,
          first_name: "Owen",
          last_name: "Young",
          type: "private",
        },
        date: 1599586867,
        text: "hello",
      },
    },
    method: "POST",
    headers: {},
  });
  const request = {
    ...requestPayload,
    params: {},
  };
  const triggerResults = await telegramBot.webhooks[0].handler.bind(
    telegramBot
  )(request);

  expect(triggerResults.length).toBe(1);
  expect(triggerResults[0].text).toBe("hello");
});

test("telegram bot trigger", async () => {
  const resp = {
    data: {
      ok: true,
      result: [
        {
          update_id: 791185170,
          message: {
            message_id: 5,
            from: {
              id: 1056059698,
              is_bot: false,
              first_name: "Owen",
              last_name: "Young",
              language_code: "en",
            },
            chat: {
              id: 1056059698,
              first_name: "Owen",
              last_name: "Young",
              type: "private",
            },
            date: 1597941277,
            text: "hello",
          },
        },
        {
          update_id: 791185171,
          message: {
            message_id: 6,
            from: {
              id: 1056059698,
              is_bot: false,
              first_name: "Owen",
              last_name: "Young",
              language_code: "en",
            },
            chat: {
              id: 1056059698,
              first_name: "Owen",
              last_name: "Young",
              type: "private",
            },
            date: 1597941280,
            photo: {},
          },
        },
      ],
    },
  };

  const mockAxios = jest.fn();

  mockAxios.mockResolvedValue(resp);
  const triggerConstructorParams = await getTriggerConstructorParams({
    name: "telegram_bot",
    cwd: path.resolve(__dirname, "fixtures"),
    workflowPath: path.resolve(__dirname, "fixtures/workflows/workflow.yml"),
    options: {
      token: TELEGRAM_TOKEN,
      event: ["text", "photo"],
    },
  });
  triggerConstructorParams.helpers.axios = (mockAxios as unknown) as AxiosStatic;
  const telegramBot = new TelegramBot(triggerConstructorParams);

  const triggerResults = await telegramBot.run();

  expect(triggerResults.length).toBe(2);

  expect(telegramBot.getItemKey(triggerResults[0])).toBe(791185170);
  const triggerConstructorParams2 = await getTriggerConstructorParams({
    name: "telegram_bot",
    cwd: path.resolve(__dirname, "fixtures"),
    workflowPath: path.resolve(__dirname, "fixtures/workflows/workflow.yml"),
    options: {
      token: TELEGRAM_TOKEN,
      event: "photo",
    },
  });
  triggerConstructorParams2.helpers.axios = (mockAxios as unknown) as AxiosStatic;

  const telegramBot2 = new TelegramBot(triggerConstructorParams2);

  const triggerResults2 = await telegramBot2.run();
  expect(triggerResults2.length).toBe(1);

  expect(telegramBot2.getItemKey(triggerResults2[0])).toBe(791185171);
});
