// LICENSE : MIT
'use strict';
const RuleError = require('./rule-error');
/**
 *
 * @param ruleConfig
 * @returns {number}
 */
function getSeverity(ruleConfig) {
    const ERROR = 2;
    const WARNING = 1;
    const NONE = 0;
    if (ruleConfig == null) {
        return ERROR;
    }
    // true or false
    if (typeof ruleConfig === "boolean") {
        return ruleConfig ? ERROR : NONE;
    }
    if (ruleConfig.warning) {
        return WARNING;
    }
    return NONE;
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
