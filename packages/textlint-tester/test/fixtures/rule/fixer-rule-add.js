// LICENSE : MIT
"use strict";

const RuleHelper = require("textlint-rule-helper").RuleHelper;

function reporter(context) {
    const {Syntax, RuleError, fixer, report, getSource} = context;
    const helper = new RuleHelper(context);
    return {
        [Syntax.Str](node){
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
                index: index,
                fix: add
            });
        }
    };
}

export default {
    linter: reporter,
    fixer: reporter
};
