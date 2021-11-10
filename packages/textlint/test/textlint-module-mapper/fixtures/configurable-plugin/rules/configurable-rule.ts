// LICENSE : MIT
"use strict";
import { TextlintRuleContext, TextlintRuleReportHandler } from "@textlint/types";

/**
 * @param {RuleContext} context
 */
export default function (context: TextlintRuleContext) {
    const exports: TextlintRuleReportHandler = {};
    exports[context.Syntax.Str] = function (node) {
        // const text = context.getSource(node);
        context.report(node, new context.RuleError("found error message"));
    };
    return exports;
}
