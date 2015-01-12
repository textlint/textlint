// LICENSE : MIT
"use strict";
/**
 * @param {RuleContext} context
 */
module.exports = function (context) {
    var exports = {};
    var limitLength = 80;
    exports[context.Syntax.Str] = function (node) {
        var text = context.getSource(node);
        if (text.length > limitLength) {
            context.report(node, new context.RuleError("This paragraph is long : \n" + text));
        }
    };
    return exports;
};