import Rss from "../rss";
import { getTriggerConstructorParams } from "./trigger.util";

test("rss trigger", async () => {
  const rss = new Rss(
    await getTriggerConstructorParams({
      options: {
        url: "https://hnrss.org/newest?points=300",
        every: 10,
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
        url: ["https://hnrss.org/newest?points=300"],
        every: 10,
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
