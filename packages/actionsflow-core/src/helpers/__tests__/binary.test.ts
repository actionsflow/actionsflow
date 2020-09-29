import { formatBinary } from "../binary";
import fs from "fs-extra";
import path from "path";
test("formatBinary", async () => {
  const binaryData = await formatBinary(Buffer.from("test"));
  expect(binaryData.data).toBe("dGVzdA==");
  expect(binaryData.mimeType).toBe("text/plain");
});

test("formatBinary for file", async () => {
  const binaryData = await formatBinary(
    await fs.readFile(path.resolve(__dirname, "./fixtures/logo.png"))
  );
  expect(binaryData.mimeType).toBe("image/png");
});
