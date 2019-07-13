// LICENSE : MIT
"use strict";
import { TextlintRuleReporter } from "@textlint/types";

const report: TextlintRuleReporter = function(context) {
    const { Syntax, report, RuleError } = context;
    return {
        [Syntax.Str](node) {
            return new Promise(resolve => {
                setTimeout(() => {
                    report(node, new RuleError("async error"));
                    resolve();
                }, 100);
            });
        }
    };
};
export default report;
