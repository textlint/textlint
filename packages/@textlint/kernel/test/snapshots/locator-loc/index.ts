import { TextlintRuleReporter } from "@textlint/types";

const report: TextlintRuleReporter = (context) => {
    const { Syntax, locator, report, RuleError, getSource } = context;
    return {
        [Syntax.Str](node) {
            const text = getSource(node);
            const lines = text.split(/\n/);
            const [firstLine, secondLine] = lines;
            if (firstLine === `Next line should not start with "!"` && secondLine.startsWith("!")) {
                report(
                    node,
                    new RuleError("This line should not start with !", {
                        padding: locator.loc({
                            // relative padding
                            start: {
                                line: 1,
                                column: 0
                            },
                            end: {
                                line: 2,
                                column: 0
                            }
                        })
                    })
                );
            }
        }
    };
};

export default report;
