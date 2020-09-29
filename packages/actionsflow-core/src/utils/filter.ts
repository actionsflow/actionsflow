import { ITrigger, IWorkflowData, AnyObject } from "../interface";
import { useOperators, OperatorType } from "mingo/core";
import mingo from "mingo";
import * as stringOperators from "mingo/operators/expression/string";

import { Cursor } from "mingo/cursor";
useOperators(OperatorType.EXPRESSION, stringOperators);

/**
 * get raw triggers from workflow data
 * @param doc
 */
export const getRawTriggers = (doc: IWorkflowData): ITrigger[] => {
  const triggers = [];
  if (doc && doc.on) {
    const onObj = doc.on as Record<string, Record<string, unknown>>;
    const keys = Object.keys(onObj);

    for (let index = 0; index < keys.length; index++) {
      const key = keys[index] as string;
      let options = {};
      if (onObj && onObj[key]) {
        options = onObj[key];
      }
      triggers.push({
        name: key,
        options: options,
      });
    }
  }
  return triggers;
};

export const filter = (
  items: AnyObject[],
  condition: AnyObject,
  projection?: AnyObject
): Cursor => {
  const cursor = mingo.find(items, condition, projection);
  return cursor;
};
