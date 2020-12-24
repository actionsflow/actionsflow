import Rss from "../rss";
import { getTriggerConstructorParams } from "./trigger.util";
jest.unmock("rss-parser");

test("rss trigger with parserConfig", async () => {
  const rss = new Rss(
    await getTriggerConstructorParams({
      options: {
        url:
          "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en",
        parserConfig: {
          customFields: {
            item: ["source"],
          },
        },
      },
      name: "rss",
    })
  );
  const triggerResults = await rss.run();
  expect(triggerResults.length).toBeGreaterThan(1);
  expect(triggerResults[0]).toHaveProperty("source");
});
