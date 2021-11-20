// LICENSE : MIT
"use strict";

import { TextlintRuleContext, TextlintRuleReportHandler } from "@textlint/types";

// This module has not module.export, but has module.export.default
// See https://github.com/textlint/textlint/issues/81
export default function (context: TextlintRuleContext): TextlintRuleReportHandler {
    return {
        [context.Syntax.Str](node) {
            context.report(node, new context.RuleError("error"));
        }
    };
}
