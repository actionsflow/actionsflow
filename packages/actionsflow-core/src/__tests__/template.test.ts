import { getTemplateStringByParentName } from "../utils/template";

test("getTemplateStringByParentName simple", () => {
  expect(
    getTemplateStringByParentName(
      "test ${{on.test.event}} true ${{github.event_type}}",
      "on",
      {
        on: {
          test: `(fromJson(env.test))`,
        },
      }
    )
  ).toBe("test ${{(fromJson(env.test)).event}} true ${{github.event_type}}");
});

test("getTemplateStringByParentName xxon #14", () => {
  expect(
    getTemplateStringByParentName(
      "test ${{ steps.translation.test.outputs.text}} true ${{github.event_type}}",
      "on",
      {
        on: {
          test: `(fromJson(env.test))`,
        },
      }
    )
  ).toBe(
    "test ${{ steps.translation.test.outputs.text}} true ${{github.event_type}}"
  );
});
test("getTemplateStringByParentName xxon complex #14", () => {
  expect(
    getTemplateStringByParentName(
      "test ${{ steps.translation.test.outputs.text}} ${{ true && on.test.event && true}} 999 ${{ true && on.test.event && true}} true true ${{github.event_type}}",
      "on",
      {
        on: {
          test: `(fromJson(env.test))`,
        },
      }
    )
  ).toBe(
    "test ${{ steps.translation.test.outputs.text}} ${{ true && (fromJson(env.test)).event && true}} 999 ${{ true && (fromJson(env.test)).event && true}} true true ${{github.event_type}}"
  );
});
test("getTemplateStringByParentName simple2", () => {
  expect(
    getTemplateStringByParentName(
      "$xxx test ${{ true && on.test.event && true}} 999 ${{ true && on.test.event && true}} true ${{github.event_type}} false$",
      "on",
      {
        on: {
          test: `(fromJson(env.test))`,
        },
      }
    )
  ).toBe(
    "$xxx test ${{ true && (fromJson(env.test)).event && true}} 999 ${{ true && (fromJson(env.test)).event && true}} true ${{github.event_type}} false$"
  );
});

test("getTemplateStringByParentName simple3", () => {
  expect(
    getTemplateStringByParentName(
      "$xxx test ${{ true && on['test'].event && true}} 999 ${{ true && on.test.event && true}} true ${{github.event_type}} false$",
      "on",
      {
        on: {
          test: `(fromJson(env.test))`,
        },
      }
    )
  ).toBe(
    "$xxx test ${{ true && (fromJson(env.test)).event && true}} 999 ${{ true && (fromJson(env.test)).event && true}} true ${{github.event_type}} false$"
  );
});
