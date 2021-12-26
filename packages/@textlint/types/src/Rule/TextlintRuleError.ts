// LICENSE : MIT
"use strict";
import { TextlintRuleContextFixCommand } from "./TextlintRuleContextFixCommand";

export type TextlintRuleErrorLocation =
    | {
          isAbsolute: boolean; // TODO: currently always relative from node position
          range: [startIndex: number, endIndex: number];
      }
    | {
          isAbsolute: boolean; // TODO: currently always relative from node position
          loc: {
              start: {
                  line: number;
                  column: number;
              };
              end: {
                  line: number;
                  column: number;
              };
          };
      };

export type TextlintRuleErrorPadding = {
    /**
     * @deprecated use `loc` property
     * ```
     * report(node, new RuleError(message, {
     *   range: locator.loc({
     *       start: {
     *           line: 1,
     *           column: 1
     *       },
     *       end: {
     *           line: 1,
     *           column: 2
     *       }
     *   })
     * });
     * ```
     */
    line?: number;
    /**
     * @deprecated use `loc` property
     * ```
     * report(node, new RuleError(message, {
     *   range: locator.loc({
     *       start: {
     *           line: 1,
     *           column: 1
     *       },
     *       end: {
     *           line: 1,
     *           column: 2
     *       }
     *   })
     * });
     * ```
     */
    column?: number;
    /**
     * @deprecated use `loc` property
     * ```
     * report(node, new RuleError(message, {
     *   range: locator.range([index, index + 1])
     * }
     * ```
     */
    index?: number;
    /**
     * Pass the range for start and end of the reported error.
     * textlint rule's context provide `locator` object as helper.
     *
     * ```
     * const { report, RuleError, locator } = context;
     * // at = range([index, index + 1]);
     * report(node, new RuleError(message, {
     *   range: locator.at(index)
     * });
     * // range
     * report(node, new RuleError(message, {
     *   range: locator.range([startIndex, endIndex])
     * });
     * // loc = line and column
     * report(node, new RuleError(message, {
     *  range: locator.loc({
     *       start: {
     *           line: 1,
     *           column: 1
     *       },
     *       end: {
     *           line: 1,
     *           column: 2
     *       }
     *   })
     * });
     */
    loc?: TextlintRuleErrorLocation;
    fix?: TextlintRuleContextFixCommand;
};

/**
 * Object version of RuleError
 * It is undocumented way. Please don't use it.
 *
 * report(node, {
 *   message: ""
 * })
 */
export type TextlintRuleReportedObject = TextlintRuleErrorPadding & {
    message: string;
    [index: string]: any;
};

export interface TextlintRuleErrorConstructor {
    new (message: string, paddingLocation?: number | TextlintRuleErrorPadding): TextlintRuleError;
}

export interface TextlintRuleError {
    readonly message: string;
    /**
     * @deprecated use `loc` property
     */
    readonly line?: number;
    /**
     * @deprecated use `loc` property
     */
    readonly column?: number;
    /**
     * @deprecated use `loc` property
     */
    readonly index?: number;
    readonly loc?: TextlintRuleErrorLocation;
    readonly fix?: TextlintRuleContextFixCommand;
}
