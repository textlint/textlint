// LICENSE : MIT
"use strict";
import type { TextlintRuleReporter, TextlintRuleReportHandler } from "@textlint/types";

const reporter: TextlintRuleReporter = function (context) {
    const exports: TextlintRuleReportHandler = {};
    exports[context.Syntax.Str] = function (node) {
        context.report(node, new context.RuleError("found error message"));
    };
    return exports;
};
export default reporter;
