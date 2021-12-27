import { TextlintRuleReporter } from "@textlint/types";

const report: TextlintRuleReporter = (context) => {
    const { Syntax, report, RuleError, getSource } = context;
    return {
        [Syntax.Str](node) {
            const text = getSource(node);
            const lines = text.split(/\n/g);
            const bugLine = lines.findIndex((line) => line.includes("🐛"));
            const bugColumn = lines[bugLine].indexOf("🐛");
            report(
                node,
                new RuleError("Found a 🐛", {
                    line: bugLine,
                    column: bugColumn
                })
            );
        }
    };
};

export default report;
