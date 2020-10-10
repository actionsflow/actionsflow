import {
  getTriggerId,
  getTriggerHelpers,
  getGeneralTriggerFinalOptions,
} from "../trigger";
import { getEventByContext } from "../event";
import { ITriggerClassType } from "../interface";
import { getContext } from "../context";

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

class TriggerTest implements ITriggerClassType {
  config = { skipFirst: true };
  async run() {
    return [];
  }
}

test("getGeneralTriggerFinalOptions", async () => {
  const options = getGeneralTriggerFinalOptions(
    new TriggerTest(),
    {},
    getEventByContext(getContext())
  );
  expect(options.skipFirst).toBe(true);
  expect(options.manualRunEvent).toEqual([]);
});

test("getGeneralTriggerFinalOptions2", async () => {
  const options = getGeneralTriggerFinalOptions(
    new TriggerTest(),
    {
      config: { manualRunEvent: "push" },
    },
    getEventByContext(getContext())
  );
  expect(options.skipFirst).toBe(true);
  expect(options.manualRunEvent).toEqual(["push"]);
});

test("getGeneralTriggerFinalOptions3", async () => {
  const options = getGeneralTriggerFinalOptions(
    new TriggerTest(),
    {
      config: { manualRunEvent: ["workflow_dispatch"] },
    },
    getEventByContext(getContext())
  );
  expect(options.skipFirst).toBe(true);
  expect(options.manualRunEvent).toEqual(["workflow_dispatch"]);
});
