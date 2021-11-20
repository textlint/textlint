// LICENSE : MIT
"use strict";

import { TextlintFilterRuleContext, TextlintRuleReportHandler } from "@textlint/types";

/**
 * @param {TextLintFilterRuleContext} context
 */
export default function (context: TextlintFilterRuleContext): TextlintRuleReportHandler {
    return {
        [context.Syntax.Str](node) {
            context.shouldIgnore(node.range, {
                ruleId: "*"
            });
        }
    };
}
