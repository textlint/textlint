import { TxtNode } from "@textlint/ast-node-types";
import type { TextlintRuleContext, TextlintRuleModule, TextlintRuleReporter } from "@textlint/types";

export const report: TextlintRuleReporter = (context: Readonly<TextlintRuleContext>) => {
    const { Syntax, report, RuleError, fixer } = context;
    return {
        [Syntax.Str](node: TxtNode) {
            report(
                node,
                new RuleError("found suggestion", {
                    suggestions: [
                        {
                            id: "suggestion-1",
                            message: "use alternative",
                            fix: fixer.replaceTextRange([0, 1], "X")
                        },
                        {
                            id: "suggestion-2",
                            message: "use another",
                            fix: fixer.replaceTextRange([0, 1], "Y")
                        }
                    ]
                })
            );
        }
    };
};

export const suggestionRule: TextlintRuleModule = {
    linter: report,
    fixer: report
};
