"use strict";
module.exports = function(context, options = {}) {
    const {Syntax, RuleError, report, getSource} = context;
    return {
        [Syntax.Str](node){ // "Str" node
            const text = getSource(text);
            if (/bugs/.test(text)) {
                const indexOfBugs = text.search(/bugs/);
                const ruleError = new RuleError("Found bugs.", {
                    index: indexOfBugs // padding of index
                });
                report(node, ruleError);
            }
        }
    }
};
