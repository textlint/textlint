/*eslint-disable */
// LICENSE : MIT

"use strict";
var traverse = require('traverse');
var StructuredSource = require('structured-source');
/**
 * parse markdown text and return ast mapped location info.
 * @param {string} text
 * @returns {TxtNode}
 */
function parse(text) {
    var mdast = require('mdast');
    var ast = mdast.parse(text);
    var SyntaxMap = require("./mapping/markdown-syntax-map");
    var src = new StructuredSource(text);
    traverse(ast).forEach(function (node) {
        if (this.notLeaf) {
            if (node.type) {
                node.type = SyntaxMap[node.type];
            }
            // map `range`, `loc` and `raw` to node
            if (node.position) {
                console.log(node.position);
                var position = node.position;
                var positionCompensated = {
                    start: {line: position.start.line, column: position.start.column - 1},
                    end: {line: position.end.line, column: position.end.column - 1}
                };
                var range = src.locationToRange(positionCompensated);
                node.loc = positionCompensated;
                node.range = range;
                node.raw = text.slice(range[0], range[1]);
                console.log(node.raw);
            }
        }
    });
    return ast;
}
module.exports = {
    parse: parse,
    Syntax: require("./union-syntax")
};