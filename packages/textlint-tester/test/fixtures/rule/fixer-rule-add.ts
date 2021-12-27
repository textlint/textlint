import { TextlintRuleReporter } from "@textlint/types";
import { RuleHelper } from "textlint-rule-helper";

const reporter: TextlintRuleReporter = (context) => {
    const { Syntax, fixer, report, getSource, locator } = context;
    const helper = new RuleHelper(context);
    return {
        [Syntax.Str](node) {
            if (helper.isChildNode(node, [Syntax.ListItem])) {
                return;
            }
            const text = getSource(node);
            if (/\.$/.test(text)) {
                return;
            }
            const index = text.length;
            const add = fixer.insertTextAfter(node, ".");
            report(node, {
                message: "Please add . to end of a sentence.",
                loc: locator.at(index),
                fix: add
            });
        }
    };
};

export default {
    linter: reporter,
    fixer: reporter
};
