import { getContext } from "../context";

test("get context", () => {
  process.env.JSON_SECRETS = `{"token":"test2333"}`;
  process.env.JSON_GITHUB = `{"event":{}}`;

  expect(getContext()).toEqual({
    github: {
      event: {},
      event_name: "workflow_dispatch",
    },
    secrets: {
      token: "test2333",
    },
  });
});

test("get context with empty", () => {
  process.env.JSON_SECRETS = `{"token":"test2333"}`;

  expect(getContext()).toEqual({
    github: {
      event_name: "workflow_dispatch",
      event: {},
    },
    secrets: {
      token: "test2333",
    },
  });
});
