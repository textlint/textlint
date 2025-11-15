import { TextlintRuleContext, TextlintRuleReportHandler } from "@textlint/types";

export default function (context: TextlintRuleContext): TextlintRuleReportHandler {
    const { Syntax, RuleError, report, fixer } = context;
    return {
        [Syntax.Str](node) {
            // Report error with suggestions
            if (node.value === "bad") {
                report(
                    node,
                    new RuleError("found bad word", {
                        suggestions: [
                            {
                                id: "s1",
                                message: "use 'good'",
                                fix: fixer.replaceText(node, "good")
                            },
                            {
                                id: "s2",
                                message: "use 'better'",
                                fix: fixer.replaceText(node, "better")
                            }
                        ]
                    })
                );
            }
        }
    };
}
