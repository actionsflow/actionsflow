import Script from "../script";
import { getTriggerConstructorParams } from "./trigger.util";
import path from "path";
import { ITriggerResultObject } from "actionsflow-core";
test("script trigger", async () => {
  const script = new Script(
    await getTriggerConstructorParams({
      options: {
        run: `return [{id:'test',title:'test'}]`,
      },
      name: "script",
    })
  );
  const triggerResults = await script.run();
  let triggerResultFormat: ITriggerResultObject = {
    items: [],
  };
  if (Array.isArray(triggerResults)) {
    triggerResultFormat.items = triggerResults;
  } else {
    triggerResultFormat = triggerResults;
  }
  expect(triggerResultFormat.items.length).toBe(1);
  const itemKey = script.getItemKey(triggerResultFormat.items[0]);
  expect(itemKey).toBe("test");
});

test("script trigger with items", async () => {
  const script = new Script(
    await getTriggerConstructorParams({
      options: {
        run: `return {items:[{id:'test',title:'test'}]}`,
      },
      name: "script",
    })
  );
  const triggerResults = await script.run();
  let triggerResultFormat: ITriggerResultObject = {
    items: [],
  };
  if (Array.isArray(triggerResults)) {
    triggerResultFormat.items = triggerResults;
  } else {
    triggerResultFormat = triggerResults;
  }
  expect(triggerResultFormat.items.length).toBe(1);
  const itemKey = script.getItemKey(triggerResultFormat.items[0]);
  expect(itemKey).toBe("test");
});

test("script trigger with options", async () => {
  const script = new Script(
    await getTriggerConstructorParams({
      options: {
        test: "222",
        run: `return  [{id:'test',title:'test',options:options}]`,
      },
      name: "script",
    })
  );
  const triggerResults = await script.run();
  let triggerResultFormat: ITriggerResultObject = {
    items: [],
  };
  if (Array.isArray(triggerResults)) {
    triggerResultFormat.items = triggerResults;
  } else {
    triggerResultFormat = triggerResults;
  }
  expect(triggerResultFormat.items.length).toBe(1);
  const options = triggerResultFormat.items[0].options as Record<
    string,
    string
  >;
  expect(options.test).toBe("222");
});

test("script trigger with deduplicationKey", async () => {
  const script = new Script(
    await getTriggerConstructorParams({
      options: {
        run: `return  [{id:'test',title:'test'}]`,
        deduplicationKey: "title",
      },
      name: "script",
    })
  );
  const triggerResults = await script.run();
  let triggerResultFormat: ITriggerResultObject = {
    items: [],
  };
  if (Array.isArray(triggerResults)) {
    triggerResultFormat.items = triggerResults;
  } else {
    triggerResultFormat = triggerResults;
  }
  expect(triggerResultFormat.items.length).toBe(1);
  const itemKey = script.getItemKey(triggerResultFormat.items[0]);
  expect(itemKey).toBe("test");
});

test("script trigger with deduplicationKey no found", async () => {
  const script = new Script(
    await getTriggerConstructorParams({
      options: {
        run: `return [{id2:'test',title:'test'}]`,
      },
      name: "script",
    })
  );
  const triggerResults = await script.run();
  let triggerResultFormat: ITriggerResultObject = {
    items: [],
  };
  if (Array.isArray(triggerResults)) {
    triggerResultFormat.items = triggerResults;
  } else {
    triggerResultFormat = triggerResults;
  }
  expect(triggerResultFormat.items.length).toBe(1);
  const itemKey = script.getItemKey(triggerResultFormat.items[0]);
  expect(itemKey).toBe("0ace22c97c74a9a75c1aabc6eb40fcdf");
});

test("script trigger without required param", async () => {
  const script = new Script(
    await getTriggerConstructorParams({
      options: {},
      name: "script",
    })
  );

  await expect(script.run()).rejects.toEqual(
    new Error(
      "Miss param run or path, you must provide one of run or path at least"
    )
  );
});

test("script trigger with file path", async () => {
  const script = new Script(
    await getTriggerConstructorParams({
      options: {
        path:
          "./packages/actionsflow/src/triggers/__tests__/fixtures/script.js",
      },
      name: "script",
    })
  );
  const triggerResults = await script.run();
  let triggerResultFormat: ITriggerResultObject = {
    items: [],
  };
  if (Array.isArray(triggerResults)) {
    triggerResultFormat.items = triggerResults;
  } else {
    triggerResultFormat = triggerResults;
  }
  expect(triggerResultFormat.items.length).toBe(2);
  const itemKey = script.getItemKey(triggerResultFormat.items[0]);
  expect(itemKey).toBe("test1");
});

test("script trigger with script require", async () => {
  process.env.GITHUB_WORKSPACE = path.normalize(process.cwd());
  const script = new Script(
    await getTriggerConstructorParams({
      options: {
        run: `
          const path = require('path')
          const script = require(path.resolve(process.env.GITHUB_WORKSPACE,"packages/actionsflow/src/triggers/__tests__/fixtures/script.js"))
          const items = await script({
            helpers,
            options
          })
          return items;
        `,
      },
      name: "script",
    })
  );
  process.env.GITHUB_WORKSPACE = "";
  const triggerResults = await script.run();
  let triggerResultFormat: ITriggerResultObject = {
    items: [],
  };
  if (Array.isArray(triggerResults)) {
    triggerResultFormat.items = triggerResults;
  } else {
    triggerResultFormat = triggerResults;
  }
  expect(triggerResultFormat.items.length).toBe(2);
  const itemKey = script.getItemKey(triggerResultFormat.items[0]);
  expect(itemKey).toBe("test1");
});

test("script trigger with github token", async () => {
  const token = process.env.GITHUB_TOKEN || "";
  if (!token) {
    // skip github test
    return;
  }

  const script = new Script(
    await getTriggerConstructorParams({
      options: {
        github_token: token,
        run: `
        const results = await github.issues.listForRepo({
          owner:"actionsflow",
          repo:"actionsflow",
        });
        return results.data
        `,
      },
      name: "script",
    })
  );
  const triggerResults = await script.run();
  let triggerResultFormat: ITriggerResultObject = {
    items: [],
  };
  if (Array.isArray(triggerResults)) {
    triggerResultFormat.items = triggerResults;
  } else {
    triggerResultFormat = triggerResults;
  }
  expect(Array.isArray(triggerResultFormat.items)).toBe(true);
});
