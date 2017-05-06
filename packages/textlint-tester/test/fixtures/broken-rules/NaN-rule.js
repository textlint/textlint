// LICENSE : MIT
"use strict";
function reporter(context) {
    const {Syntax, RuleError, fixer, report, getSource} = context;
    return {
        [Syntax.Str](node){
            report(node, {
                message: "This Report Is Invalid Range",
                index: NaN
            });
        }
    };
}

module.exports = {
    linter: reporter,
    fixer: reporter
};
