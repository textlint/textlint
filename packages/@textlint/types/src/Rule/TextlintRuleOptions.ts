/**
 * textlint rule option values is object or boolean.
 * if this option value is false, disable the rule.
 */
import { TextlintRuleSeverityLevelKey } from "./TextlintRuleSeverityLevelKey.js";

export type TextlintRuleOptions<T extends object = object> = {
    [index: string]: unknown;
    severity?: TextlintRuleSeverityLevelKey;
} & T;
