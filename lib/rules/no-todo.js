// LICENSE : MIT
"use strict";
/**
 *
 * @param {RuleContext} context
 */
module.exports = function (context) {
    var exports = {};
    exports[context.Syntax.Str] = function (node) {
        if (/todo:/i.test(node.raw)) {
            context.report(node, "found Todo: " + node.raw);
        }
    };
    exports[context.Syntax.List] = function (node) {
        if (/\[\s*?\]\s/i.test(node.raw)) {
            context.report(node, "found Todo: " + node.list_data.bullet_char + node.raw.trim());
        }
    };
    return exports;
};
