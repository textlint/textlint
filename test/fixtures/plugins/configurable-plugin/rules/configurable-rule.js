// LICENSE : MIT
"use strict";
/**
 * @param {RuleContext} context
 */
module.exports = function (context, options) {
    var exports = {};
    exports[context.Syntax.Str] = function (node) {
        var text = context.getSource(node);
        context.report(node, new context.RuleError("found error message"));
    };
    return exports;
}