// LICENSE : MIT
"use strict";
/**
 * @param {RuleContext} context
 */
export default function(context) {
    var exports = {};
    exports[context.Syntax.Str] = function(node) {
        context.report(node, new context.RuleError("found error message"));
    };
    return exports;
}
