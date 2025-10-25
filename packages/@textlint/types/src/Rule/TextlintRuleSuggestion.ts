import { TextlintRuleContextFixCommand } from "./TextlintRuleContextFixCommand";

export interface TextlintRuleSuggestion {
    id: string;
    message: string;
    fix: TextlintRuleContextFixCommand;
}
