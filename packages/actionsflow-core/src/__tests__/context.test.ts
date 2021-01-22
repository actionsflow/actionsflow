import { getContext } from "../context";
import path from "path";
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
  delete process.env.JSON_SECRETS;
  delete process.env.JSON_GITHUB;
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
  delete process.env.JSON_SECRETS;
});

test("get context with .secrets", () => {
  expect(
    getContext({
      cwd: path.resolve(__dirname, "fixtures"),
    })
  ).toEqual({
    github: {
      event_name: "workflow_dispatch",
      event: {},
    },
    secrets: {
      TEST: "ttt",
      GITHUB_TOKEN: "xxx",
      github_token: "xxx",
    },
  });
});
