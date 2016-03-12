// LICENSE : MIT
"use strict";
const assert = require("assert");
import RuleFixer from "../fixer/rule-fixer-commaner";
import RuleError from "./rule-error";
import {SeverityLevel, getSeverity} from "../shared/rule-severity";

/**
 * Rule context object is passed to each rule as `context`
 * @param ruleId
 * @param sourceCode
 * @param report
 * @param textLintConfig
 * @param ruleConfig
 * @returns {*}
 * @constructor
 */
export default function RuleContext(ruleId, sourceCode, report, textLintConfig, ruleConfig) {
    Object.defineProperty(this, "id", {value: ruleId});
    Object.defineProperty(this, "config", {value: textLintConfig});
    const severity = getSeverity(ruleConfig);
    /**
     *
     * @param {TxtNode} node
     * @param {RuleError|any} error error is a RuleError instance or any data
     */
    this.report = function (node, error) {
        assert(!(node instanceof RuleError), "should be `report(node, ruleError);`");
        if (error instanceof RuleError) {
            report({ruleId, node, severity, error});
        } else {
            const level = error.severity || SeverityLevel.info;
            report({ruleId, node, severity: level, error});
        }
    };
    // Const Values
    Object.defineProperty(this, "Syntax", {
        get(){
            return sourceCode.getSyntax();
        }
    });
    this.getFilePath = sourceCode.getFilePath.bind(sourceCode);
    this.getSource = sourceCode.getSource.bind(sourceCode);
    // CustomError object
    this.RuleError = RuleError;
    // fixer
    this.fixer = new RuleFixer();
}
