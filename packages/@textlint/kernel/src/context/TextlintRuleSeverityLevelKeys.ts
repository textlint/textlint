import type { TextlintRuleSeverityLevel, TextlintRuleSeverityLevelKey } from "@textlint/types";

/**
 * Keys of TextlintRuleSeverityLevel
 */
export const TextlintRuleSeverityLevelKeys: {
    [index in TextlintRuleSeverityLevelKey]: TextlintRuleSeverityLevel;
} = {
    none: 0,
    warning: 1,
    error: 2,
    info: 3
};
