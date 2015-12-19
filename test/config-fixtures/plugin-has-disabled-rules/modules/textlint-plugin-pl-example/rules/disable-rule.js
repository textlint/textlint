"use strict";
module.exports = function (context) {
    var exports = {};
    exports[context.Syntax.Str] = function (node) {
        var text = context.getSource(node);
        context.report(node, new context.RuleError("found error message"));
    };
    return exports;
};