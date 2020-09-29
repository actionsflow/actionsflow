import { getContext } from "../context";

test("get context", () => {
  process.env.JSON_SECRETS = `{"token":"test2333"}`;
  process.env.JSON_GITHUB = `{"event":{}}`;

  expect(getContext()).toEqual({
    github: {
      event: {},
    },
    secrets: {
      token: "test2333",
    },
  });
});
