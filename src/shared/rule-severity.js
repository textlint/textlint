// LICENSE : MIT
"use strict";
const assert = require("assert");
import SeverityLevel from "./type/SeverityLevel";
/**
 * get severity level from ruleConfig.
 * @param {Object|boolean|undefined} ruleConfig
 * @returns {number}
 */
export function getSeverity(ruleConfig) {
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
