// LICENSE : MIT
"use strict";
var Syntax = require("../union-syntax");
var LINEBREAKE_MARK = "\n";
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
 * parse text and return ast mapped location info.
 * @param {string} text
 * @returns {TxtNode}
 */
function parse(text) {
    var textLineByLine = text.split(LINEBREAKE_MARK);
    // line break
    var children = textLineByLine.reduce(function (result, currentLine, index) {
        var strNode = parseLine(currentLine, index + 1);
        result.push(strNode);
        result.push(breakNextToStrNode(strNode));
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