// LICENSE : MIT
"use strict";
function reporter(context) {
    const { Syntax, RuleError, fixer, report, getSource } = context;
    return {
        [Syntax.Str](node) {
            report(node, {
                message: "This Report Is Invalid column",
                line: 0,
                column: 100000000
            });
        }
    };
}

module.exports = {
    linter: reporter,
    fixer: reporter
};
