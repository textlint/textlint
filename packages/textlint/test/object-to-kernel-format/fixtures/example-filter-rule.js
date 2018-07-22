// LICENSE : MIT
"use strict";

const linter = function(context) {
    return {
        [context.Syntax.Str](_node) {
            return;
        }
    };
};
module.exports = linter;
