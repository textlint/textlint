// LICENSE : MIT
"use strict";
import type { TextlintRuleModule } from "@textlint/types";

const reporter: TextlintRuleModule = function (context) {
    return {
        [context.Syntax.Str](node) {
            context.report(node, new context.RuleError("found error message"));
        }
    };
};
export default {
    linter: reporter,
    fixer: reporter
};
