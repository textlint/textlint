// LICENSE : MIT
"use strict";
import { TextlintRuleCreator } from "@textlint/kernel";

const linter: TextlintRuleCreator = function(context) {
    return {
        [context.Syntax.Str](node) {
            context.report(node, new context.RuleError("found error message"));
        }
    };
};
/**
 * @param {RuleContext} context
 */
export default linter;
