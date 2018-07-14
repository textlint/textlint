// LICENSE : MIT
"use strict";
import { TextlintRuleModule } from "@textlint/kernel";

const linter: TextlintRuleModule = function(context) {
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
