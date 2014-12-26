// LICENSE : MIT
"use strict";
var Syntax = require("../union-syntax");
var LINEBREAKE_MARK = /\r?\n/g;
function parseLine(lineText, lineNumber) {
    return {
        type: Syntax.Str,
        raw: lineText,
        loc: {
            start: {
                line: lineNumber,
                column: 1
            },
            end: {
                line: lineNumber,
                column: lineText.length
            }
        }
    };
}
/**
 * create BreakNode next to StrNode
 * @param {TxtNode} strNode
 */
function breakNextToStrNode(strNode) {
    return {
        type: Syntax.Break,
        raw: "\n",
        loc: {
            start: {
                line: strNode.loc.line,
                column: strNode.loc.column + 1
            },
            end: {
                line: strNode.loc.line,
                column: strNode.loc.column + 2
            }
        }
    };
}
/**
 * create paragraph node from TxtNodes
 * @param {[TxtNode]} nodes
 * @returns {TxtNode} Paragraph node
 */
function createParagraph(nodes) {
    var firstNode = nodes[0];
    var lastNode = nodes[nodes.length - 1];
    return {
        type: Syntax.Paragraph,
        raw: nodes.map(function (node) {
            return node.raw;
        }).join(""),
        loc: {
            start: {
                line: firstNode.loc.line,
                column: firstNode.loc.column
            },
            end: {
                line: lastNode.loc.line,
                column: lastNode.loc.column
            }
        },
        children: nodes
    };
}
/**
 * parse text and return ast mapped location info.
 * @param {string} text
 * @returns {TxtNode}
 */
function parse(text) {
    var textLineByLine = text.split(LINEBREAKE_MARK);
    // it should be alternately Str and Break
    var children = textLineByLine.reduce(function (result, currentLine, index) {
        var strNode = parseLine(currentLine, index + 1);
        var brNode = breakNextToStrNode(strNode);
        var paragraph = createParagraph([strNode, brNode]);
        result.push(paragraph);
        return result;
    }, []);
    return {
        type: Syntax.Document,
        loc: {
            start: {
                line: 1,
                column: 1
            },
            end: {
                line: textLineByLine.length,
                column: textLineByLine[textLineByLine.length - 1].length
            }
        },
        children: children
    };
}
module.exports = parse;