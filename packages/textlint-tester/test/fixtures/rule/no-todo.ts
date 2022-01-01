import { TextlintRuleContext, TextlintRuleReportHandler } from "@textlint/types";
import { RuleHelper } from "textlint-rule-helper";

export default function (context: TextlintRuleContext): TextlintRuleReportHandler {
    const helper = new RuleHelper(context);
    const { Syntax, getSource, RuleError, report, locator } = context;
    return {
        /*
            # Header
            Todo: quick fix this.
        */
        [Syntax.Str](node) {
            if (helper.isChildNode(node, [Syntax.Link, Syntax.Image, Syntax.BlockQuote])) {
                return;
            }
            // get text from node
            const text = getSource(node);
            // Does the text contain "todo:"?
            const matches = text.matchAll(/todo:/gi);
            for (const match of matches) {
                const index = match.index ?? 0;
                const length = match[0].length;
                report(
                    node,
                    new RuleError(`Found TODO: '${text}'`, {
                        padding: locator.range([index, index + length])
                    })
                );
            }
        },
        /*
            # Header
            - [ ] Todo
        */
        [Syntax.ListItem](node) {
            const text = context.getSource(node);
            // Does the ListItem's text starts with `- [ ]`
            const match = text.match(/^-\s\[\s+]\s/i);
            if (match && match.index !== undefined) {
                report(
                    node,
                    new context.RuleError(`Found TODO: '${text}'`, {
                        padding: locator.range([match.index, match.index + match[0].length])
                    })
                );
            }
        }
    };
}
