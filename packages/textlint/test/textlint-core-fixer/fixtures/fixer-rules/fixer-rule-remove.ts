// LICENSE : MIT
"use strict";

import { TextlintRuleModule } from "@textlint/types";

const reporter: TextlintRuleModule = (context) => {
    const { Syntax, fixer, report, getSource } = context;
    return {
        [Syntax.Str](node) {
            const text = getSource(node);
            const matchRegexp = /<REMOVE_MARK>/;
            if (!matchRegexp.test(text)) {
                return;
            }
            const index = text.search(matchRegexp);
            const length = "<REMOVE_MARK>".length;
            report(node, {
                message: "Removed",
                fix: fixer.removeRange([index, index + length])
            });
        }
    };
};
export default {
    linter: reporter,
    fixer: reporter
};
