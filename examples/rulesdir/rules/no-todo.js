// LICENSE : MIT
"use strict";

/**
 * Get parents of node.
 * The parent nodes are returned in order from the closest parent to the outer ones.
 * @param node
 * @returns {Array}
 */
function getParents(node) {
    var result = [];
    var parent = node.parent;
    while (parent != null) {
        result.push(parent);
        parent = parent.parent;
    }
    return result;
}
/**
 * Return true if `node` is wrapped any one of `types`.
 * @param {TxtNode} node is target node
 * @param {string[]} types are wrapped target node
 * @returns {boolean}
 */
function isNodeWrapped(node, types) {
    var parents = getParents(node);
    var parentsTypes = parents.map(function (parent) {
        return parent.type;
    });
    return types.some(function (type) {
        return parentsTypes.some(function (parentType) {
            return parentType === type;
        });
    });
}
/**
 * @param {RuleContext} context
 */
module.exports = function (context) {
    var exports = {};
    // When `Node`'s type is `Str` come, call this callback.
    /*
    e.g.)
        # Header

        This is Str.

        Todo: quick fix this.
    */
    // "This is Str." and "Todo: quick fix this." are `Str` type.
    // This callback function is called twice.
    exports[context.Syntax.Str] = function (node) {
        var Syntax = context.Syntax;
        if (isNodeWrapped(node, [Syntax.Link, Syntax.Image, Syntax.BlockQuote])) {
            return;
        }
        // get text from node
        var text = context.getSource(node);
        // does text contain "todo:"?
        if (/todo:/i.test(text)) {
            context.report(node, new context.RuleError("found TODO: '" + text + "'"));
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
        if (/\[\s+\]\s/i.test(text)) {
            context.report(node, new context.RuleError("found TODO: '" + text + "'"));
        }
    };
    return exports;
};
