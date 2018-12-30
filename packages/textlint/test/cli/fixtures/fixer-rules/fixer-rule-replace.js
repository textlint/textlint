// LICENSE : MIT
"use strict";
const reporter = context => {
    const { Syntax, RuleError, fixer, report, getSource } = context;
    return {
        [Syntax.Str](node) {
            const text = getSource(node);
            const matchRegexp = /\bfix\b/;
            if (!matchRegexp.test(text)) {
                return;
            }
            const index = text.search(matchRegexp);
            const length = "fix".length;
            const replace = fixer.replaceTextRange([index, index + length], "fixed");
            report(node, {
                message: "Replaced",
                fix: replace
            });
        }
    };
};
export default {
    linter: reporter,
    fixer: reporter
};
