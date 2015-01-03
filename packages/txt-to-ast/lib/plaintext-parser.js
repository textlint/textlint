// LICENSE : MIT
"use strict";
var Syntax = require("./plaintext-syntax");
var LINEBREAKE_MARK = /\r?\n/g;
function parseLine(lineText, lineNumber, startIndex) {
    return {
        type: Syntax.Str,
        raw: lineText,
        range: [startIndex, startIndex + lineText.length],
        loc: {
            start: {
                line: lineNumber,
                column: 0
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
        range: [strNode.range[1], strNode.range[1] + 1],
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
        range: [firstNode.range[0], lastNode.range[1]],
        loc: {
            start: {
                line: firstNode.loc.start.line,
                column: firstNode.loc.start.column
            },
            end: {
                line: lastNode.loc.end.line,
                column: lastNode.loc.end.column
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
    var startIndex = 0;
    var children = textLineByLine.reduce(function (result, currentLine, index) {
        var strNode = parseLine(currentLine, index + 1, startIndex);
        var paragraph = createParagraph([strNode]);
        startIndex += paragraph.raw.length;
        result.push(paragraph);
        return result;
    }, []);
    return {
        type: Syntax.Document,
        range: [0, text.length],
        loc: {
            start: {
                line: 1,
                column: 0
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