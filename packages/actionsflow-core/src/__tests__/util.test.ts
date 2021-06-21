import {
  getStringFunctionResult,
  getExpressionResult,
  isPromise,
  getRawTriggers,
  filter,
  getParamsByWebhookPath,
} from "../utils";
import emails from "./fixtures/emails.json";
import weather from "./fixtures/weather.json";

test("filter", () => {
  const items = emails;
  const filterResults = filter(items, {
    "from.value": {
      $elemMatch: {
        address: "test3@gmail.com",
      },
    },
    subject: {
      $regex: "hash2",
    },
  });
  expect(filterResults.all().length).toBe(1);
});
test("filter not", () => {
  const items = emails;
  const filterResults = filter(items, {
    subject: {
      $not: {
        $regex: "hash2",
      },
    },
  });
  expect(filterResults.all().length).toBe(2);
});
test("filter weather", () => {
  const items = [weather];
  const filterResults = filter(items, {
    "daily.0.weather.0.main": {
      $eq: "Clear",
    },
  });
  expect(filterResults.all().length).toBe(1);
});
test("filter nest", () => {
  const items = [
    {
      id: 1,
      current: {
        temp: 12,
      },
    },
  ];
  const filterResults = filter(items, {
    "current.temp": {
      $lt: 13,
    },
  });
  expect(filterResults.all().length).toBe(1);
});
test("filter outputs", () => {
  const items = emails;
  const filterResults = filter(
    items,
    {
      "from.value": {
        $elemMatch: {
          address: "test3@gmail.com",
        },
      },
      subject: {
        $regex: "hash2",
      },
    },
    {
      subject: {
        $substrBytes: ["$subject", 0, 7],
      },
    }
  );
  expect(filterResults.all().length).toBe(1);
  expect(JSON.stringify(filterResults.all())).toBe('[{"subject":"[hash2]"}]');
});

test("isPromise yes", () => {
  const is = isPromise(
    new Promise((resolve) => {
      return resolve(1);
    })
  );
  expect(is).toBe(true);
});

test("isPromisee no", () => {
  const is = isPromise({ test: 1 });
  expect(is).toBe(false);
});
test("getExpressionResult", () => {
  expect(
    getExpressionResult("data.test", { data: { test: "testvalue" } })
  ).toBe("testvalue");
});
test("getStringFunction object", () => {
  expect(
    getStringFunctionResult("return item.message", {
      item: {
        message: {
          id: "messageid",
        },
      },
    })
  ).toEqual({
    id: "messageid",
  });
});
test("getStringFunction object require", () => {
  expect(
    getStringFunctionResult("const path = require('path'); return path.sep", {
      require: require,
      item: {
        message: {
          id: "messageid",
        },
      },
    })
  ).toEqual("/");
});
test("get raw trigger", () => {
  expect(
    getRawTriggers({
      on: {
        rss: {
          url: "test",
        },
        poll: {
          url: "test2",
        },
      },
    })
  ).toEqual([
    {
      name: "rss",
      options: { url: "test" },
    },
    {
      name: "poll",
      options: { url: "test2" },
    },
  ]);
});

test("getParamsByWebhookPath", () => {
  const triggerName = getParamsByWebhookPath("/test/test_1/test");
  expect(triggerName).toEqual({
    workflowFileName: "test",
    triggerName: "test_1",
    path: "/test",
  });
});

test("getParamsByWebhookPath 2", () => {
  const triggerName = getParamsByWebhookPath("/test/test_1");
  expect(triggerName).toEqual({
    workflowFileName: "test",
    triggerName: "test_1",
    path: "/",
  });
});

test("getParamsByWebhookPath 3", () => {
  const triggerName = getParamsByWebhookPath("/test/test_1/");
  expect(triggerName).toEqual({
    workflowFileName: "test",
    triggerName: "test_1",
    path: "/",
  });
});
test("getParamsByWebhookPath 4", () => {
  const triggerName = getParamsByWebhookPath(
    "/test/test_1/xxx/xxx/xxx/xxx/?x=1"
  );
  expect(triggerName).toEqual({
    workflowFileName: "test",
    triggerName: "test_1",
    path: "/xxx/xxx/xxx/xxx/?x=1",
  });
});

test("getParamsByWebhookPath 5", () => {
  const triggerName = getParamsByWebhookPath("/test/");
  expect(triggerName).toBe(undefined);
});
