import { TextlintRuleReporter } from "@textlint/types";

const report: TextlintRuleReporter = (context) => {
    const { Syntax, locator, report, RuleError, getSource } = context;
    return {
        [Syntax.Str](node) {
            const text = getSource(node);
            const bugMatches = text.matchAll(/bug/gi);
            for (const bugMatch of bugMatches) {
                if (bugMatch.index === undefined) {
                    continue;
                }
                report(
                    node,
                    new RuleError("Found a bug", {
                        loc: locator.at(bugMatch.index)
                    })
                );
            }
        }
    };
};

export default report;
