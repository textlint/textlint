// LICENSE : MIT
"use strict";

const linter = function (context) {
    return {
        [context.Syntax.Str](node) {
            context.report(node, new context.RuleError("found error message"));
        }
    };
};
module.exports = linter;
