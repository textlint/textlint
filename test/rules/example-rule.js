// LICENSE : MIT
"use strict";
/**
 *
 * @param {RuleContext} context
 */
module.exports = function (context) {
    var exports = {};
    exports[context.Syntax.Str] = function (node) {
        context.report(node, "found error messag");
    };
    return exports
};