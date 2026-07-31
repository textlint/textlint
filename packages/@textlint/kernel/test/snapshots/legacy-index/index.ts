import type { TextlintRuleReporter } from "@textlint/types";

const report: TextlintRuleReporter = (context) => {
    const { Syntax, report, RuleError, getSource } = context;
    return {
        [Syntax.Str](node) {
            const text = getSource(node);
            const bugMatches = text.matchAll(/🐛+/gu);
            for (const bugMatch of bugMatches) {
                if (bugMatch.index === undefined) {
                    continue;
                }
                report(
                    node,
                    new RuleError("Found a 🐛", {
                        index: bugMatch.index
                    })
                );
            }
        }
    };
};

export default report;
