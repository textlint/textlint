// LICENSE : MIT
"use strict";
const assert = require("assert");
import RuleFixer from "../fixer/rule-fixer-commaner";
import RuleError from "./rule-error";
import SeverityLevel from "../shared/type/SeverityLevel";
import {getSeverity} from "../shared/rule-severity";
/**
 * This callback is displayed as a global member.
 * @callback ReportCallback
 * @param {ReportMessage} message
 */

/**
 * Rule context object is passed to each rule as `context`
 * @param {string} ruleId
 * @param {SourceCode} sourceCode
 * @param {ReportCallback} report
 * @param {function(ReportIgnoreMessage)} ignoreReport
 * @param {Config} textLintConfig
 * @param {Object|boolean} ruleConfig
 * @returns {*}
 * @constructor
 */
export default function RuleContext({ruleId, sourceCode, report, ignoreReport, textLintConfig, ruleConfig}) {
    Object.defineProperty(this, "id", {value: ruleId});
    Object.defineProperty(this, "config", {value: textLintConfig});
    const severity = getSeverity(ruleConfig);


    /**
     * report ignoring range
     * @param {number[]} range
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
     * report function that is called in a rule
     * @param {TxtNode} node
     * @param {RuleError|any} ruleError error is a RuleError instance or any data
     */
    this.report = function (node, ruleError) {
        assert(!(node instanceof RuleError), "should be `report(node, ruleError);`");
        if (ruleError instanceof RuleError) {
            report({ruleId, node, severity, ruleError});
        } else {
            const level = ruleError.severity || SeverityLevel.error;
            report({ruleId, node, severity: level, ruleError});
        }
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
    /**
     * CustomError object
     * @type {RuleError}
     */
    this.RuleError = RuleError;
    /**
     * Rule fixer command object
     * @type {RuleFixer}
     */
    this.fixer = new RuleFixer();
}
