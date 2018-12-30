// LICENSE : MIT
"use strict";
module.exports = function(context) {
    const exports = {};
    exports[`${context.Syntax.Str}:exit`] = function() {
        throw new Error("Error in rule");
    };
    return exports;
};
