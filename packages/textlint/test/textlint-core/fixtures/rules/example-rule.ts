// LICENSE : MIT
"use strict";
import type { TextlintRuleReporter } from "@textlint/types";

const reporter: TextlintRuleReporter = function (context) {
    return {
        [context.Syntax.Str](node) {
            context.report(node, new context.RuleError("found error message"));
        }
    };
};
export default reporter;
