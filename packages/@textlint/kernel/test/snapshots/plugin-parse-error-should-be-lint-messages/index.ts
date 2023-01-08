import { TextlintRuleReporter } from "@textlint/types";

// disallow to write CodeBlock
const report: TextlintRuleReporter = (context) => {
    const { Syntax, report, RuleError } = context;
    return {
        [Syntax.CodeBlock](node) {
            report(node, new RuleError("DO NOT WRITE CODE"));
        }
    };
};
export default report;
