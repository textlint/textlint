// LICENSE : MIT
"use strict";

import { TextlintRuleContext, TextlintRuleReportHandler } from "@textlint/types";

const reporter = (context: TextlintRuleContext): TextlintRuleReportHandler => {
    const { Syntax, fixer, report, getSource } = context;
    return {
        [Syntax.Str](node) {
            const text = getSource(node);
            if (/\.$/.test(text)) {
                return;
            }
            const add = fixer.insertTextAfter(node, ".");
            report(node, {
                message: "Added",
                fix: add
            });
        }
    };
};

export default {
    linter: reporter,
    fixer: reporter
};
