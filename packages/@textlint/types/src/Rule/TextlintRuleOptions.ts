/**
 * textlint rule option values is object or boolean.
 * if this option value is false, disable the rule.
 */
import { TextlintRuleSeverityLevelKey } from "./TextlintRuleSeverityLevelKey";

export type TextlintRuleOptions<T extends object = {}> = {
    [index: string]: any;
    severity?: TextlintRuleSeverityLevelKey;
} & T;
