// LICENSE : MIT
"use strict";
import { TextlintRuleModule } from "@textlint/kernel";

const reporter: TextlintRuleModule = function(context) {
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
