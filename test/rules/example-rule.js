// LICENSE : MIT
"use strict";
/**
 *
 * @param {RuleContext} context
 */
module.exports = function (context) {
    var exports = {};
    exports[context.Syntax.Str] = function (node) {
        console.log(node);
    };
    return exports
};