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

function RuleContext(ruleId, agent, textLintConfig, ruleConfig) {
    Object.defineProperty(this, 'id', {value: ruleId});
    Object.defineProperty(this, 'config', {value: textLintConfig});
    let severity = getSeverity(ruleConfig);
    /**
     *
     * @param {TxtNode} node
     * @param {RuleError|any} error error is a RuleError instance or any data
     */
    this.report = function (node, error) {
        if (error instanceof RuleError) {
            agent.pushReport({ruleId, node, severity, error});
        } else {
            let level = error.severity || SeverityLevel.info;
            agent.pushReport({ruleId, node, severity: level, error});
        }
    };
    // Const Values
    Object.defineProperty(this, 'Syntax', {
        get(){
            return agent.getSyntax();
        }
    });
    this.getFilePath = agent.getFilePath.bind(agent);
    this.getSource = agent.getSource.bind(agent);
    // CustomError object
    this.RuleError = RuleError;
}
module.exports = RuleContext;
