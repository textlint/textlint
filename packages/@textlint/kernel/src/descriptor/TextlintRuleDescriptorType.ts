import { TextlintLintableRuleDescriptor } from "./TextlintLintableRuleDescriptor";
import { TextlintFixableRuleDescriptor } from "./TextlintFixableRuleDescriptor";

export const enum TextlintRuleDescriptorType {
    LINTER = "LINTER",
    LINTER_AND_FIXER = "LINTER_AND_FIXER"
}

export function isLinter(ruleDescriptor: any): ruleDescriptor is TextlintLintableRuleDescriptor {
    return ruleDescriptor && ruleDescriptor.type === TextlintRuleDescriptorType.LINTER;
}

export function isFixable(ruleDescriptor: any): ruleDescriptor is TextlintFixableRuleDescriptor {
    return ruleDescriptor && ruleDescriptor.type === TextlintRuleDescriptorType.LINTER_AND_FIXER;
}
