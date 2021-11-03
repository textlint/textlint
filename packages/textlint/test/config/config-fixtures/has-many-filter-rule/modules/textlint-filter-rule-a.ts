import { TextlintFilterRuleContext, TextlintRuleReportHandler } from "@textlint/types";

export default function (context: TextlintFilterRuleContext) {
    const exports: TextlintRuleReportHandler = {};
    exports[context.Syntax.Str] = function (node) {
        context.shouldIgnore(node.range, {});
    };
    return exports;
}
