// LICENSE : MIT
"use strict";
export default {
    linter(context){

    },
    fixer(context){
        const {Syntax, RuleError, fixer, report, getSource} = context;
        return {
            [Syntax.Str](node){
                const text = getSource(node);
                if (/\.$/.test(text)) {
                    return;
                }
                var add = fixer.insertTextAfter(node, ".");
                report(node, {
                    fix: add
                });
            }
        }
    }
}