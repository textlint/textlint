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
                const bugRange = [bugMatch.index, bugMatch.index + bugMatch[0].length] as const;
                report(
                    node,
                    new RuleError("Found a bug", {
                        padding: locator.range(bugRange)
                    })
                );
            }
        }
    };
};

export default report;
