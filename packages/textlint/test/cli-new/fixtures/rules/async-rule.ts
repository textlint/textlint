// LICENSE : MIT
"use strict";

import { TextlintRuleContext, TextlintRuleReportHandler } from "@textlint/types";

export default function (context: TextlintRuleContext): TextlintRuleReportHandler {
    const { Syntax, report, RuleError } = context;
    return {
        [Syntax.Str](node) {
            return new Promise<void>((resolve) => {
                setTimeout(() => {
                    report(node, new RuleError("async error"));
                    resolve();
                }, 100);
            });
        }
    };
}
