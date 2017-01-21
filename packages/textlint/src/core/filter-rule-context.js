// LICENSE : MIT
"use strict";
const assert = require("assert");
/**
 * This callback is displayed as a global member.
 * @callback ReportCallback
 * @param {ReportIgnoreMessage} message
 */

/**
 * Rule context object is passed to each rule as `context`
 * @param {string} ruleId
 * @param {SourceCode} sourceCode
 * @param {function(ReportIgnoreMessage)} ignoreReport
 * @param {Config} textLintConfig
 * @constructor
 */
export default function FilterRuleContext({ruleId, sourceCode, ignoreReport, textLintConfig}) {
    Object.defineProperty(this, "id", {value: ruleId});
    Object.defineProperty(this, "config", {value: textLintConfig});
    /**
     * Report range for filtering
     * @param {number[]} range the `range` is absolute position values
     * @param {{ ruleId: string }} [optional] ignoring option object
     * - `ruleId` match the TextLintMessage.ruleId and filter the message. (default: `ruleId` of the rule)
     *   if `ruleId` is "*", match any TextLintMessage.ruleId.
     */
    this.shouldIgnore = function (range, optional = {}) {
        assert(Array.isArray(range) && typeof range[0] === "number" && typeof range[1] === "number",
            "shouldIgnore([number, number]); accept range.");
        ignoreReport({ruleId, range, optional});
    };
    /**
     * Node's type values
     * @type {TextLintNodeType}
     */
    this.Syntax = sourceCode.getSyntax();
    /**
     * get file path current processing.
     * @type {Function}
     */
    this.getFilePath = sourceCode.getFilePath.bind(sourceCode);
    /**
     * get source code text
     * @type {Function}
     */
    this.getSource = sourceCode.getSource.bind(sourceCode);
}
