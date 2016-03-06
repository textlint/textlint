// LICENSE : MIT
"use strict";
function reporter(context) {
    const {Syntax, RuleError, fixer, report, getSource} = context;
    return {
        [Syntax.Str](node){
            const text = getSource(node);
            if (/\.$/.test(text)) {
                return;
            }
            const index = text.length;
            const add = fixer.insertTextAfter(node, ".");
            report(node, {
                message: "Please add . to end of a sentence.",
                index: index,
                fix: add
            });
        }
    };
}

export default {
    linter: reporter,
    fixer: reporter
};