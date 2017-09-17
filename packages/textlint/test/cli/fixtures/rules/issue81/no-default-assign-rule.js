// LICENSE : MIT
"use strict";
// This module has not module.export, but has module.export.default
// See https://github.com/textlint/textlint/issues/81
module.exports.__esModule = true;
module.exports.default = function(context) {
    const exports = {};
    exports[context.Str] = function(node) {
        context.report(node, new context.RuleError("error"));
    };
    return exports;
};
