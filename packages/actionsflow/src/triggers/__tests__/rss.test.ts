import Rss from "../rss";
import { getTriggerConstructorParams } from "./trigger.util";
test("rss trigger", async () => {
  const rss = new Rss(
    await getTriggerConstructorParams({
      options: {
        url: "https://actionsflow.github.io/test-page/hn-rss.xml",
      },
      name: "rss",
    })
  );
  const triggerResults = await rss.run();

  expect(triggerResults.length).toBe(2);
});

test("rss trigger with multiple urls", async () => {
  const rss = new Rss(
    await getTriggerConstructorParams({
      options: {
        url: ["https://actionsflow.github.io/test-page/hn-rss.xml"],
      },
      name: "rss",
    })
  );
  const triggerResults = await rss.run();

  expect(triggerResults.length).toBe(2);
});
test("rss trigger without required param", async () => {
  const rss = new Rss(
    await getTriggerConstructorParams({
      options: {},
      name: "rss",
    })
  );

  await expect(rss.run()).rejects.toEqual(new Error("Miss required param url"));
});
