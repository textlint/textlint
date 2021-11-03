import { TextlintRuleContext, TextlintRuleReportHandler } from "@textlint/types";

export default function (context: TextlintRuleContext) {
    const exports: TextlintRuleReportHandler = {};
    exports[context.Syntax.Str] = function (node) {
        context.report(node, new context.RuleError("found error message"));
    };
    return exports;
}
