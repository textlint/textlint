// LICENSE : MIT
"use strict";

import { TextlintRuleContext, TextlintRuleReportHandler } from "@textlint/types";

/**
 * @param {RuleContext} context
 */
export default function (context: TextlintRuleContext): TextlintRuleReportHandler {
    return {
        [context.Syntax.Str](node) {
            context.report(node, new context.RuleError("found error message"));
        }
    };
}
