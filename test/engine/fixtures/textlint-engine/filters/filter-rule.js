// LICENSE : MIT
"use strict";
/**
 * @param {TextLintFilterRuleContext} context
 */
module.exports = function (context) {
    var exports = {};
    exports[context.Syntax.Str] = function (node) {
        context.shouldIgnore(node.range, {
            ruleId: "*"
        });
    };
    return exports;
};
