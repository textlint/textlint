// LICENSE : MIT
"use strict";

/**
 * @param {import("@textlint/types").TextlintRuleContext} context
 */
export default function (context) {
    return {
        [context.Syntax.Str](node) {
            context.report(node, new context.RuleError("found error message"));
        }
    };
}
