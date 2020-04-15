// LICENSE : MIT
"use strict";
/**
 * @param {TextLintFilterRuleContext} context
 */
module.exports = function (context) {
    const exports = {};
    exports[context.Syntax.Str] = function (node) {
        context.shouldIgnore(node.range, {
            ruleId: "*"
        });
    };
    return exports;
};
