import { TextlintRuleContextFixCommand } from "./TextlintRuleContextFixCommand.js";

export interface TextlintRuleSuggestion {
    id: string;
    message: string;
    fix: TextlintRuleContextFixCommand;
}
