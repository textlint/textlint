// LICENSE : MIT
"use strict";

function reporter(context) {
    const { Syntax } = context;
    return {
        [Syntax.Str](node) {
            node.__modified__value = true;
        }
    };
}

module.exports = {
    linter: reporter,
    fixer: reporter
};
