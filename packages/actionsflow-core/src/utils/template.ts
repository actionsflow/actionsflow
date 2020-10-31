import has from "lodash.has";
import matchAll from "string.prototype.matchall";

import { AnyObject } from "../interface";
interface IOptions {
  interpolate?: RegExp;
  shouldReplaceUndefinedToEmpty?: boolean;
}
interface IVariableHandleOptions {
  text: string;
  regex: RegExp;
  regexResult: RegExpExecArray;
  currentIndex: number;
  shouldReplaceUndefinedToEmpty: boolean;
  context: AnyObject;
}
/**
 * get asts by parent name
 * @param {*} text
 * @param {*} name
 * @example
 * getAstsByParentName('test ${{on.test.outputs.test}}',"on")
 * @return [
 * {
 *   type:"text",
 *   start: 0,
 *   end: 10
 * },
 * {
 *   type: "expression",
 *   start:10,
 *   end: 15
 * }
 * ]
 */
export const getAstsByParentName = (
  text: string,
  name: string
): { type: string; start: number; end: number }[] => {
  const asts: { type: string; start: number; end: number }[] = [];
  // step1 , get syntax need handle
  // use for ${{}} expression

  const interpolate = /(\$\{\{)([\S\s]*?)(\}\})/g;
  // use for on.xxxx on['xxx'] expression
  const specificExpressionRegexString = `(\\(|\\s|^)(${name}([.\\[](.+?))\\]?)[.\\[]`;
  // const specificExpressionRegexString = `(${name}([.\\[](.+?))\\]?)[.\\[]`;

  const specificExpressionTestRegex = new RegExp(specificExpressionRegexString);
  const specificExpressionRegex = new RegExp(
    specificExpressionRegexString,
    "g"
  );
  // match all ${{ }} expression
  const interpolateMatchRawResults = matchAll(text, interpolate);
  const interpolateMatchResults = [...interpolateMatchRawResults];

  // matched
  if (interpolateMatchResults.length > 0) {
    // matche object to array type

    // check first
    const firstInterpolateMatchResult = interpolateMatchResults[0];
    let currentEnd = 0;
    if ((firstInterpolateMatchResult.index as number) > 0) {
      asts.push({
        start: 0,
        end: firstInterpolateMatchResult.index as number,
        type: "text",
      });
      currentEnd = firstInterpolateMatchResult.index as number;
    }
    interpolateMatchResults.forEach((interpolateMatchResult, index) => {
      const startSyntaxLength = interpolateMatchResult[1].length;
      const endSyntaxLength = interpolateMatchResult[3].length;
      // matched item index start
      // let start = currentEnd;
      // push ${{ first
      asts.push({
        start: currentEnd,
        end: currentEnd + startSyntaxLength,
        type: "text",
      });
      const fullExpressionEndIndex =
        interpolateMatchResult[0].length + currentEnd - endSyntaxLength;
      currentEnd = currentEnd + startSyntaxLength;
      const fullExpressionStartIndex = currentEnd;

      // raw full expression text
      const rawFullExpressionText = interpolateMatchResult[2] || "";
      if (specificExpressionRegex && rawFullExpressionText) {
        // is expression include "on",

        const isIncludeSpecificExpressionSyntax = specificExpressionTestRegex.test(
          rawFullExpressionText
        );

        if (isIncludeSpecificExpressionSyntax) {
          // if include

          const specificExpressRawResults = matchAll(
            rawFullExpressionText,
            specificExpressionRegex
          );
          const specificExpressionResults = [...specificExpressRawResults];

          if (specificExpressionResults.length > 0) {
            // check especially syntax string
            const firstSpecificExpressionMatchResult =
              specificExpressionResults[0];
            if ((firstSpecificExpressionMatchResult.index as number) > 0) {
              asts.push({
                start: currentEnd,
                end:
                  (firstSpecificExpressionMatchResult.index as number) +
                  (firstSpecificExpressionMatchResult[1].length as number) +
                  currentEnd,
                type: "text",
              });
              currentEnd =
                (firstSpecificExpressionMatchResult.index as number) +
                (firstSpecificExpressionMatchResult[1].length as number) +
                currentEnd;
            }

            specificExpressionResults.forEach(
              (specificExpressionResult, index) => {
                // matched item end index
                asts.push({
                  start: currentEnd,
                  end: specificExpressionResult[2].length + currentEnd,
                  type: "expression",
                });
                currentEnd = specificExpressionResult[2].length + currentEnd;

                // add specificEnd to next start
                const nextSpecificExpressionStartIndex = specificExpressionResults[
                  index + 1
                ]
                  ? (specificExpressionResults[index + 1].index as number) +
                    fullExpressionStartIndex
                  : rawFullExpressionText.length + fullExpressionStartIndex;

                if ((nextSpecificExpressionStartIndex as number) > currentEnd) {
                  asts.push({
                    start: currentEnd,
                    end: nextSpecificExpressionStartIndex as number,
                    type: "text",
                  });
                  currentEnd = nextSpecificExpressionStartIndex;
                }
              }
            );
          } else {
            asts.push({
              start: currentEnd,
              end: fullExpressionEndIndex,
              type: "text",
            });
            currentEnd = fullExpressionEndIndex;
          }
        } else {
          asts.push({
            start: currentEnd,
            end: fullExpressionEndIndex,
            type: "text",
          });
          currentEnd = fullExpressionEndIndex;
        }
      } else {
        asts.push({
          start: currentEnd,
          end: fullExpressionEndIndex,
          type: "text",
        });
        currentEnd = fullExpressionEndIndex;
      }
      // add }}
      asts.push({
        start: currentEnd,
        end: currentEnd + endSyntaxLength,
        type: "text",
      });
      currentEnd = currentEnd + endSyntaxLength;

      // add string to next start ${{

      // add specificEnd to next start
      const nextInterpolateMatchResultStartIndex = interpolateMatchResults[
        index + 1
      ]
        ? interpolateMatchResults[index + 1].index
        : text.length;

      if ((nextInterpolateMatchResultStartIndex as number) > currentEnd) {
        asts.push({
          start: currentEnd,
          end: nextInterpolateMatchResultStartIndex as number,
          type: "text",
        });
        currentEnd = nextInterpolateMatchResultStartIndex as number;
      }
    });
  } else {
    asts.push({
      start: 0,
      end: text.length,
      type: "text",
    });
  }
  return asts;
};

export const getExpressionResult = (
  expressionText: string,
  context: AnyObject
): string => {
  return Function("with(this){\nreturn " + expressionText + "\n}").call(
    context
  );
};
export const getStringFunctionResult = (
  expressionText: string,
  context: AnyObject
): unknown => {
  return Function("with(this){\n" + expressionText + "\n}").call(context);
};
const variableHandle = ({
  text,
  regex,
  regexResult,
  currentIndex,
  shouldReplaceUndefinedToEmpty,
  context,
}: IVariableHandleOptions) => {
  if (shouldReplaceUndefinedToEmpty) {
    let variableName = regexResult[1];
    variableName = variableName.trim();
    if (has(context, variableName)) {
      return [
        JSON.stringify(
          text.slice(currentIndex, regex.lastIndex - regexResult[0].length)
        ),
        "(" + regexResult[1] + ")",
      ];
    } else {
      return [
        JSON.stringify(
          text.slice(currentIndex, regex.lastIndex - regexResult[0].length)
        ),
      ];
    }
  } else {
    return [
      JSON.stringify(
        text.slice(currentIndex, regex.lastIndex - regexResult[0].length)
      ),
      "(" + regexResult[1] + ")",
    ];
  }
};

export const template = function (
  text: string,
  context: AnyObject,
  options?: IOptions
): string {
  let interpolate = /\$\{\{([\S\s]*?)\}\}/g;
  let shouldReplaceUndefinedToEmpty = false;
  if (options) {
    if (options.interpolate) {
      interpolate = options.interpolate;
    }

    if (typeof options.shouldReplaceUndefinedToEmpty !== "undefined") {
      shouldReplaceUndefinedToEmpty = options.shouldReplaceUndefinedToEmpty;
    }
  }
  // Andrea Giammarchi - WTFPL License
  const stringify = JSON.stringify;
  const re = interpolate;
  let evaluate: string[] = [],
    i = 0,
    m;

  while ((m = re.exec(text))) {
    evaluate = evaluate.concat(
      variableHandle({
        regex: re,
        currentIndex: i,
        regexResult: m,
        shouldReplaceUndefinedToEmpty,
        text,
        context,
      })
    );
    i = re.lastIndex;
  }

  evaluate.push(stringify(text.slice(i)));
  // Function is needed to opt out from possible "use strict" directive
  return Function("with(this)return " + evaluate.join("+")).call(context);
};

export const getTemplateStringByParentName = (
  text: string,
  parentName: string,
  context: AnyObject
): string => {
  const asts = getAstsByParentName(text, parentName);
  let finalResults = "";
  asts.forEach((ast) => {
    const string = text.slice(ast.start, ast.end);
    if (ast.type === "expression") {
      finalResults = finalResults + getExpressionResult(string, context);
    } else {
      finalResults = finalResults + string;
    }
  });
  return finalResults;
};
