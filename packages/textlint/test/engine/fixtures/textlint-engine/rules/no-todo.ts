// LICENSE : MIT
"use strict";
import { TextlintRuleContext, TextlintRuleReportHandler } from "@textlint/types";
import { RuleHelper } from "textlint-rule-helper";
/**
 * @param {RuleContext} context
 */
export default function (context: TextlintRuleContext): TextlintRuleReportHandler {
    // @ts-ignore
    const helper = new RuleHelper(context);
    const { Syntax, getSource, RuleError, report } = context;
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
            // does text contain "todo:"?
            const match = text.match(/todo:/i);
            if (match) {
                report(
                    node,
                    new RuleError(`Found TODO: '${text}'`, {
                        index: match.index
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
            const match = text.match(/\[\s+\]\s/i);
            if (match) {
                report(
                    node,
                    new context.RuleError(`Found TODO: '${text}'`, {
                        index: match.index
                    })
                );
            }
        }
    };
}
