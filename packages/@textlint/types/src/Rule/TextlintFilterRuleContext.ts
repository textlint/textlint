// LICENSE : MIT
"use strict";
import { TextlintBaseRuleContext } from "./TextlintBaseRuleContext.js";

/**
 * Message of ignoring
 * @typedef {Object} ReportIgnoreMessage
 * @property {string} ruleId
 * @property {number[]} range
 * @property {string} ignoringRuleId to ignore ruleId
 * "*" is special case, it match all ruleId(work as wildcard).
 */
export interface TextlintFilterRuleShouldIgnoreFunctionArgs {
    ruleId: string;
    range: readonly [startIndex: number, endIndex: number];
    optional: {
        ruleId?: string;
    };
}

export declare type TextlintFilterRuleShouldIgnoreFunction = (args: TextlintFilterRuleShouldIgnoreFunctionArgs) => void;

/**
 * Rule context object is passed to each rule as `context`
 * @param ruleId
 * @param sourceCode
 * @param ignoreReport shouldIgnore function
 * @constructor
 */
export interface TextlintFilterRuleContext extends TextlintBaseRuleContext {
    shouldIgnore(range: readonly [startIndex: number, endIndex: number], optional: Record<string, unknown>): void;
}
