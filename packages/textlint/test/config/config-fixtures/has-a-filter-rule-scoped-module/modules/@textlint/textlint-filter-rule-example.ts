import { TextlintFilterRuleContext, TextlintRuleReportHandler } from "@textlint/types";

export default function (context: TextlintFilterRuleContext): TextlintRuleReportHandler {
    return {
        [context.Syntax.Str](node) {
            context.shouldIgnore(node.range, {});
        }
    };
}
