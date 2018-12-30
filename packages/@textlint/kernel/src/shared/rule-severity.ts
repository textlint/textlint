// LICENSE : MIT
"use strict";
import { TextlintRuleOptions, TextlintRuleSeverityLevel } from "@textlint/types";

const isSeverityLevelValue = (type: any): type is TextlintRuleSeverityLevel => {
    if (type === undefined) {
        throw new Error(`Please set following value to severity:
"rule-key": {
    "severity": "<warning|error>"
}`);
    }
    return true;
};

/**
 * get severity level from ruleConfig.
 * @param {Object|boolean|undefined} ruleConfig
 * @returns {number}
 */
export function getSeverity(ruleConfig?: TextlintRuleOptions): TextlintRuleSeverityLevel {
    if (ruleConfig === undefined) {
        return TextlintRuleSeverityLevel.error;
    }
    // rule:<true|false>
    if (typeof ruleConfig === "boolean") {
        return ruleConfig ? TextlintRuleSeverityLevel.error : TextlintRuleSeverityLevel.none;
    }
    if (ruleConfig.severity) {
        const severityValue = TextlintRuleSeverityLevel[ruleConfig.severity];
        if (!isSeverityLevelValue(severityValue)) {
            throw new Error(`Please set following value to severity:
"rule-key": {
    "severity": "<warning|error>"
}`);
        }
        return severityValue;
    }
    return TextlintRuleSeverityLevel.error;
}
