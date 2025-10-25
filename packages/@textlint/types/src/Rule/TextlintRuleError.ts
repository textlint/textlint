// LICENSE : MIT
"use strict";
import { TextlintRuleContextFixCommand } from "./TextlintRuleContextFixCommand.js";
import { TextlintRuleSuggestion } from "./TextlintRuleSuggestion.js";

export type TextlintRuleErrorPaddingLocationLoc = {
    start: {
        line: number;
        column: number;
    };
    end: {
        line: number;
        column: number;
    };
};
export type TextlintRuleErrorPaddingLocationRange = readonly [startIndex: number, endIndex: number];
export type TextlintRuleErrorPaddingLocation =
    | {
          type: "TextlintRuleErrorPaddingLocation";
          isAbsolute: boolean; // TODO: currently always relative from node position
          range: TextlintRuleErrorPaddingLocationRange;
      }
    | {
          type: "TextlintRuleErrorPaddingLocation";
          isAbsolute: boolean; // TODO: currently always relative from node position
          loc: TextlintRuleErrorPaddingLocationLoc;
      };

export type TextlintRuleErrorDetails = {
    /**
     * @deprecated use `padding` property
     * ```
     * report(node, new RuleError(message, {
     *   padding: locator.loc({
     *       start: {
     *           line: 1,
     *           column: 1
     *       },
     *       end: {
     *           line: 1,
     *           column: 2
     *       }
     *   })
     * }));
     * ```
     */
    line?: number;
    /**
     * @deprecated use `padding` property
     * ```
     * report(node, new RuleError(message, {
     *   padding: locator.loc({
     *       start: {
     *           line: 1,
     *           column: 1
     *       },
     *       end: {
     *           line: 1,
     *           column: 2
     *       }
     *   })
     * }));
     * ```
     */
    column?: number;
    /**
     * @deprecated use `padding` property
     * ```
     * report(node, new RuleError(message, {
     *   padding: locator.range([index, index + 1])
     * }))
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
     *   padding: locator.at(index)
     * }));
     * // range
     * report(node, new RuleError(message, {
     *   padding: locator.range([startIndex, endIndex])
     * });
     * // loc = line and column
     * report(node, new RuleError(message, {
     *   padding: locator.loc({
     *       start: {
     *           line: 1,
     *           column: 1
     *       },
     *       end: {
     *           line: 1,
     *           column: 2
     *       }
     *   })
     * }));
     */
    padding?: TextlintRuleErrorPaddingLocation;
    fix?: TextlintRuleContextFixCommand;
    suggestions?: TextlintRuleSuggestion[];
};

/**
 * Object version of RuleError
 * It is undocumented way. Please don't use it.
 *
 * report(node, {
 *   message: ""
 * })
 */
export type TextlintRuleReportedObject = TextlintRuleErrorDetails & {
    message: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [index: string]: any;
};

export interface TextlintRuleErrorConstructor {
    new (message: string, paddingLocation?: number | TextlintRuleErrorDetails): TextlintRuleError;
}

export interface TextlintRuleError {
    readonly message: string;
    /**
     * @deprecated use `padding` property
     */
    readonly line?: number;
    /**
     * @deprecated use `padding` property
     */
    readonly column?: number;
    /**
     * @deprecated use `padding` property
     */
    readonly index?: number;
    readonly padding?: TextlintRuleErrorPaddingLocation;
    readonly fix?: TextlintRuleContextFixCommand;
    readonly suggestions?: TextlintRuleSuggestion[];
}
