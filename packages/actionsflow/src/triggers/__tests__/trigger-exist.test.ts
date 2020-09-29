import triggers from "../index";
import { ITriggerClassTypeConstructable } from "actionsflow-core";
import { getTriggerConstructorParams } from "./trigger.util";

test("is all trigger is a valid class", async () => {
  const allTriggerKeys = Object.keys(triggers);
  const allTriggers = triggers as Record<
    string,
    ITriggerClassTypeConstructable
  >;
  for (let i = 0; i < allTriggerKeys.length; i++) {
    const key = allTriggerKeys[i];
    const Trigger = allTriggers[key];
    const trigger = new Trigger(
      await getTriggerConstructorParams({
        options: {},
        name: key,
      })
    );
    const run = trigger.run;
    const webhooks = trigger.webhooks;
    expect(!!run || !!webhooks).toBe(true);
  }
});
