// LICENSE : MIT
"use strict";

import { TextlintFilterRuleContext, TextlintRuleReportHandler } from "@textlint/types";

/**
 * @param {TextLintFilterRuleContext} context
 */
export default function (context: TextlintFilterRuleContext) {
    const exports: TextlintRuleReportHandler = {};
    exports[context.Syntax.Str] = function (node) {
        context.shouldIgnore(node.range, {
            ruleId: "*"
        });
    };
    return exports;
}
