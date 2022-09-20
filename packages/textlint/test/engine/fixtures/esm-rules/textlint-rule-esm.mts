import type { TextlintRuleContext, TextlintRuleReportHandler } from "@textlint/types";

// pure esm rule
export default function(context: TextlintRuleContext): TextlintRuleReportHandler {
    return {
        [context.Syntax.Str](node) {
            context.report(node, new context.RuleError("esm error"));
        }
    };
}
