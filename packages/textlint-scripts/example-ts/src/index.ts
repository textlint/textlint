"use strict";
import common from "./common";
import { TextlintRuleModule, TextlintRuleReporter } from "@textlint/types";

const report: TextlintRuleReporter = function (context, options = {}) {
    const { Syntax, RuleError, report, getSource } = context;
    return {
        // async test
        async [Syntax.Code](node) {
            return null;
        },
        [Syntax.Str](node) {
            // "Str" node
            const text = getSource(node);
            // check prh
            const result = common(text);
            if (result.diffs.length > 0) {
                result.diffs.forEach((diff) => {
                    const ruleError = new RuleError("Found " + diff.expected + "!", {
                        index: diff.index // padding of index
                    });
                    report(node, ruleError);
                });
            }
            // check inline
            if (/bugs/.test(text)) {
                const indexOfBugs = text.search(/bugs/);
                const ruleError = new RuleError("Found bugs.", {
                    index: indexOfBugs // padding of index
                });
                report(node, ruleError);
            }
        }
    };
};
export default {
    linter: report,
    fixer: report
} as TextlintRuleModule;
