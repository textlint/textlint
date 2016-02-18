/*eslint-disable */
// LICENSE : MIT

"use strict";
var traverse = require('traverse');
var StructuredSource = require('structured-source');
var debug = require("debug")("markdown-to-ast");
var remark = require("remark");
/**
 * Remove undocumented properties on TxtNode from node
 * @param {TxtNode} node already has loc,range
 */
function removeUnusedProperties(node) {
    if (typeof node !== "object") {
        return;
    }
    ["position"].forEach(function (key) {
        if (node.hasOwnProperty(key)) {
            delete node[key];
        }
    });
}

/**
 * parse markdown text and return ast mapped location info.
 * @param {string} text
 * @returns {TxtNode}
 */
function parse(text) {
    var ast = remark.parse(text);
    var SyntaxMap = require("./mapping/markdown-syntax-map");
    var src = new StructuredSource(text);
    traverse(ast).forEach(function (node) {
        if (this.notLeaf) {
            if (node.type) {
                var replacedType = SyntaxMap[node.type];
                if (!replacedType) {
                    debug("replacedType : " + replacedType + " , node.type: " + node.type);
                } else {
                    node.type = replacedType;
                }
            }
            // map `range`, `loc` and `raw` to node
            if (node.position) {
                var position = node.position;
                var positionCompensated = {
                    start: {line: position.start.line, column: position.start.column - 1},
                    end: {line: position.end.line, column: position.end.column - 1}
                };
                var range = src.locationToRange(positionCompensated);
                node.loc = positionCompensated;
                node.range = range;
                node.raw = text.slice(range[0], range[1]);
            }
            removeUnusedProperties(node);
        }
    });
    return ast;
}
module.exports = {
    parse: parse,
    Syntax: require("./union-syntax")
};