import { getTemplateStringByParentName } from "../utils/template";
test("getTemplateStringByParentName god simple", () => {
  expect(
    getTemplateStringByParentName("${{on.test.event}}", "on", {
      on: {
        test: `(fromJson(env.test))`,
      },
    })
  ).toBe("${{(fromJson(env.test)).event}}");
});

test("getTemplateStringByParentName god simple2", () => {
  expect(
    getTemplateStringByParentName("${{ on.test.event}}", "on", {
      on: {
        test: `(fromJson(env.test))`,
      },
    })
  ).toBe("${{ (fromJson(env.test)).event}}");
});
test("getTemplateStringByParentName god simple3", () => {
  expect(
    getTemplateStringByParentName("${{on.test.event }}", "on", {
      on: {
        test: `(fromJson(env.test))`,
      },
    })
  ).toBe("${{(fromJson(env.test)).event }}");
});
test("getTemplateStringByParentName god simple4", () => {
  expect(
    getTemplateStringByParentName("${{ toJSON(on.test.event) }}", "on", {
      on: {
        test: `(fromJson(env.test))`,
      },
    })
  ).toBe("${{ toJSON((fromJson(env.test)).event) }}");
});
test("getTemplateStringByParentName god simple5", () => {
  expect(
    getTemplateStringByParentName("${{ toJSON(on.test.outputs) }}", "on", {
      on: {
        test: `(fromJson(env.test))`,
      },
    })
  ).toBe("${{ toJSON((fromJson(env.test)).outputs) }}");
});
test("getTemplateStringByParentName god simple6", () => {
  expect(
    getTemplateStringByParentName(
      "${{ toJSON(on['test']['outputs']) }}",
      "on",
      {
        on: {
          test: `(fromJson(env.test))`,
        },
      }
    )
  ).toBe("${{ toJSON((fromJson(env.test))['outputs']) }}");
});

test("getTemplateStringByParentName god simple7", () => {
  expect(
    getTemplateStringByParentName(
      '${{ toJSON(on["test"]["outputs"]) }}',
      "on",
      {
        on: {
          test: `(fromJson(env.test))`,
        },
      }
    )
  ).toBe('${{ toJSON((fromJson(env.test))["outputs"]) }}');
});
test("getTemplateStringByParentName god simple8", () => {
  expect(
    getTemplateStringByParentName(
      '${{ true && toJSON(on["test"]["outputs"]) && true }}',
      "on",
      {
        on: {
          test: `(fromJson(env.test))`,
        },
      }
    )
  ).toBe('${{ true && toJSON((fromJson(env.test))["outputs"]) && true }}');
});
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
