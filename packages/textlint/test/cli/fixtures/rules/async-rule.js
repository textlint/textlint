// LICENSE : MIT
"use strict";

import { TextlintRuleContext, TextlintRuleReportHandler } from "@textlint/types";

/**
 * @param {import("@textlint/types").TextlintRuleContext} context
 */
export default function (context) {
    const { Syntax, report, RuleError } = context;
    return {
        [Syntax.Str](node) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    report(node, new RuleError("async error"));
                    resolve();
                }, 100);
            });
        }
    };
}
