// LICENSE : MIT
"use strict";
/**
 * @param {RuleContext} context
 */
module.exports = function (context) {
    var exports = {};
    // When `node`'s type is `Str` come, call this callback.
    /*
    e.g.)
        # Header

        this is Str.

        Todo: quick fix this.
    */
    // `Str` is "this is Str." and "Todo: quick fix this.", so called this callback twice.
    exports[context.Syntax.Str] = function (node) {
        // get text from node
        var text = context.getSource(node);
        // does text contain "todo:"?
        if (/todo:/i.test(text)) {
            context.report(node, new context.RuleError("found Todo: " + text));
        }
    };
    // When `node`'s type is `ListItem` come, call this callback.
    /*
    e.g.)
        # Header

        - list 1
        - [ ] todo
    */
    // `List` is "- list 1" and - [ ] todo", so called this callback twice.
    exports[context.Syntax.ListItem] = function (node) {
        var text = context.getSource(node);
        if (/\[\s*?\]\s/i.test(text)) {
            context.report(node, new context.RuleError("found Todo: " + text));
        }
    };
    return exports;
};
