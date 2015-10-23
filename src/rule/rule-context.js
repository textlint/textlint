// LICENSE : MIT
'use strict';
const RuleError = require('./rule-error');
const assert = require('assert');
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

function RuleContext(ruleId, textLint, textLintConfig, ruleConfig) {
    Object.defineProperty(this, 'id', {value: ruleId});
    Object.defineProperty(this, 'config', {value: textLintConfig});
    let severity = getSeverity(ruleConfig);
    /**
     *
     * @param {TxtNode} node
     * @param {RuleError} error
     */
    this.report = function (node, error) {
        textLint.pushReport({ruleId, node, severity, error});
    };
    // Const Values
    Object.defineProperty(this, 'Syntax', {
        get(){
            return textLint.getSyntax();
        }
    });
    /** {@link textLint.getSource} */
    this.getSource = textLint.getSource.bind(textLint);
    // CustomError object
    this.RuleError = RuleError;
}
module.exports = RuleContext;
