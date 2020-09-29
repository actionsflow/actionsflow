import { createContentDigest } from "../create-content-digest";

test("check createContentDigest object hash", () => {
  expect(
    createContentDigest({
      test: 1,
    })
  ).toBe("3f5cf25ee3f69ec1ec1b6d97b6c15241");
});
test("check createContentDigest string hash", () => {
  expect(createContentDigest("test")).toBe("098f6bcd4621d373cade4e832627b4f6");
});
