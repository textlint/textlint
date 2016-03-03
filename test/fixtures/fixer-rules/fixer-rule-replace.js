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
                const matchRegexp = /\bfix\b/;
                if (!matchRegexp.test(text)) {
                    return;
                }
                const index = text.search(matchRegexp);
                const length = "fix".length;
                var replace = fixer.replaceTextRange([index, index + length], "fixed");
                report(node, {
                    message: "fixed",
                    fix: replace
                });
            }
        }
    }
}