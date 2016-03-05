// LICENSE : MIT
'use strict';
const assert = require('assert');
const RuleFixer = require("../fixer/rule-fixer-commaner");
const RuleError = require('./rule-error');
const SeverityLevel = {
    "none": 0,
    "info": 0,
    "warning": 1,
    "error": 2
};
/**
 *
 * @param ruleConfig
 * @returns {number}
 */
function getSeverity(ruleConfig) {
    if (ruleConfig == null) {
        return SeverityLevel.error;
    }
    // rule:<true|false>
    if (typeof ruleConfig === "boolean") {
        return ruleConfig ? SeverityLevel.error : SeverityLevel.none;
    }
    if (ruleConfig.severity) {
        assert(SeverityLevel[ruleConfig.severity] !== undefined, `please set
"rule-key": {
    "severity": "<warning|error>"
}`);
        return SeverityLevel[ruleConfig.severity];
    }
    return SeverityLevel.error;
}

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
function RuleContext(ruleId, sourceCode, report, textLintConfig, ruleConfig) {
    Object.defineProperty(this, 'id', {value: ruleId});
    Object.defineProperty(this, 'config', {value: textLintConfig});
    let severity = getSeverity(ruleConfig);
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
            let level = error.severity || SeverityLevel.info;
            report({ruleId, node, severity: level, error});
        }
    };
    // Const Values
    Object.defineProperty(this, 'Syntax', {
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
module.exports = RuleContext;
