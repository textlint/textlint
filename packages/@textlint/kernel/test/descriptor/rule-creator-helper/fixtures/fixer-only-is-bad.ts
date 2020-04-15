// LICENSE : MIT
"use strict";
import { TextlintRuleModule } from "@textlint/kernel";

const reporter: TextlintRuleModule = (context) => {
    const { Syntax, fixer, report, RuleError, getSource } = context;
    return {
        [Syntax.Str](node) {
            const text = getSource(node);
            if (/\.$/.test(text)) {
                return;
            }
            report(
                node,
                new RuleError("Added", {
                    fix: fixer.insertTextAfter(node, ".")
                })
            );
        }
    };
};

export default {
    fixer: reporter
};
