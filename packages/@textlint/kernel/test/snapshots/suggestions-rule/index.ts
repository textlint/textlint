import { TextlintRuleModule } from "@textlint/types";

// Rule that reports suggestions for Str nodes
const report: TextlintRuleModule = (context) => {
    const { Syntax, report, RuleError } = context;
    return {
        [Syntax.Str](node) {
            report(
                node,
                new RuleError("found problem", {
                    suggestions: [
                        {
                            id: "s1",
                            message: "use 'suggestion 1'",
                            fix: {
                                isAbsolute: false,
                                range: [0, node.value.length],
                                text: "suggestion1"
                            }
                        },
                        {
                            id: "s2",
                            message: "use 'suggestion 2'",
                            fix: {
                                isAbsolute: false,
                                range: [0, node.value.length],
                                text: "suggestion2"
                            }
                        }
                    ]
                })
            );
        }
    };
};
export default report;
