// LICENSE : MIT
"use strict";
/**
 * @param {RuleContext} context
 */
module.exports = function(context) {
    const exports = {};
    exports[context.Syntax.Str] = function(node) {
        const text = context.getSource(node);
        context.report(node, new context.RuleError("found error message"));
    };
    return exports;
};
