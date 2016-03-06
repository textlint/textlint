// LICENSE : MIT
"use strict";
import {RuleHelper} from "textlint-rule-helper";
/**
 * @param {RuleContext} context
 */
export default function (context) {
    var helper = new RuleHelper(context);
    var Syntax = context.Syntax;
    return {
        /*
            # Header
            Todo: quick fix this.
        */
        [Syntax.Str](node) {
            var Syntax = context.Syntax;
            if (helper.isChildNode(node, [Syntax.Link, Syntax.Image, Syntax.BlockQuote])) {
                return;
            }
            // get text from node
            var text = context.getSource(node);
            // does text contain "todo:"?
            var match = text.match(/todo:/i);
            if (match) {
                context.report(node, new context.RuleError(`found TODO: '${text}'`, {
                    index: match.index
                }));
            }
        },
        /*
            # Header
            - [ ] Todo
        */
        [Syntax.ListItem](node) {
            var text = context.getSource(node);
            var match = text.match(/\[\s+\]\s/i);
            if (match) {
                context.report(node, new context.RuleError(`found TODO: '${text}'`, {
                    index: match.index
                }));
            }
        }
    }
};
