import { getTriggerId, getTriggerHelpers } from "../trigger";

test("get trigger id", () => {
  expect(
    getTriggerId({
      name: "test",
      workflowRelativePath: "test.yml",
    })
  ).toBe("368459a7f7a75d9648fe2dea2322c00d");
});

test("getTriggerHelpers", async () => {
  const helpers = getTriggerHelpers({
    name: "rss",
    workflowRelativePath: "test.yml",
  });
  expect(helpers).toHaveProperty("cache");
  expect(helpers).toHaveProperty("createContentDigest");
  expect(helpers).toHaveProperty("log");
  await helpers.cache.reset();
});
