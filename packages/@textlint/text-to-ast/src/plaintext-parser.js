// LICENSE : MIT
"use strict";
const Syntax = require("./plaintext-syntax");
const matchAll = require("string.prototype.matchall");

function parseLine(lineText, lineNumber, startIndex) {
    // Inline Node have `value`. It it not part of TxtNode.
    // TODO: https://github.com/textlint/textlint/issues/141
    return {
        type: Syntax.Str,
        raw: lineText,
        value: lineText,
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
 * @param {TxtNode} prevNode previous node from BreakNode
 */
function createEndedBRNode(prevNode, lineBreakText) {
    return {
        type: Syntax.Break,
        raw: lineBreakText,
        value: lineBreakText,
        range: [prevNode.range[1], prevNode.range[1] + lineBreakText.length],
        loc: {
            start: {
                line: prevNode.loc.end.line,
                column: prevNode.loc.end.column
            },
            end: {
                line: prevNode.loc.end.line,
                column: prevNode.loc.end.column + lineBreakText.length
            }
        }
    };
}

/**
 * create BreakNode next to StrNode
 */
function createBRNode(lineNumber, startIndex) {
    return {
        type: Syntax.Break,
        raw: "\n",
        range: [startIndex, startIndex + 1],
        loc: {
            start: {
                line: lineNumber,
                column: 0
            },
            end: {
                line: lineNumber,
                column: 1
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
    const firstNode = nodes[0];
    const lastNode = nodes[nodes.length - 1];
    return {
        type: Syntax.Paragraph,
        raw: nodes
            .map(function(node) {
                return node.raw;
            })
            .join(""),
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

function splitTextByLine(text) {
    const LINEBREAKE_MARK_PATTERN = /\r?\n/g;
    const matches = matchAll(text, LINEBREAKE_MARK_PATTERN);
    const results = [];
    let match = null;
    let prevMatchIndex = 0;
    while ((match = LINEBREAKE_MARK_PATTERN.exec(text)) !== null) {
        const slicedText = text.slice(prevMatchIndex, prevMatchIndex + match.index);
        results.push({
            text: prevMatchIndex === match.index ? "" : slicedText,
            lineBreak: match[0]
        });
        prevMatchIndex = match.index + match[0].length;
    }
    if (text.length !== prevMatchIndex) {
        results.push({
            text: text.slice(prevMatchIndex, text.length),
            lineBreak: null
        });
    }
    return results;
}

/**
 * parse text and return ast mapped location info.
 * @param {string} text
 * @returns {TxtNode}
 */
function parse(text) {
    const textLineByLine = splitTextByLine(text);
    // it should be alternately Str and Break
    let startIndex = 0;
    const lastLineIndex = textLineByLine.length - 1;
    const isLastEmptyLine = (line, index) => {
        return index === lastLineIndex && line.text === "";
    };
    const isEmptyLine = (line, index) => {
        return index !== lastLineIndex && line.text === "";
    };
    const children = textLineByLine.reduce(function(result, currentLine, index) {
        const lineNumber = index + 1;
        if (isLastEmptyLine(currentLine, index)) {
            return result;
        }
        // \n
        if (isEmptyLine(currentLine, index)) {
            const emptyBreakNode = createBRNode(lineNumber, startIndex);
            startIndex += emptyBreakNode.raw.length;
            result.push(emptyBreakNode);
            return result;
        }

        // (Paragraph > Str) -> Br?
        const strNode = parseLine(currentLine.text, lineNumber, startIndex);
        const paragraph = createParagraph([strNode]);
        startIndex += paragraph.raw.length;
        result.push(paragraph);
        // add Break node with actual line break value
        // It should support CRLF
        // https://github.com/textlint/textlint/issues/656
        if (currentLine.lineBreak !== null) {
            const breakNode = createEndedBRNode(paragraph, currentLine.lineBreak);
            startIndex += breakNode.raw.length;
            result.push(breakNode);
        }
        return result;
    }, []);
    const lastLine = textLineByLine[textLineByLine.length - 1];
    return {
        type: Syntax.Document,
        raw: text,
        range: [0, text.length],
        loc: {
            start: {
                line: 1,
                column: 0
            },
            end:
                // if Last Line has line break
                lastLine.lineBreak !== null
                    ? {
                          line: textLineByLine.length + 1,
                          column: 0
                      }
                    : {
                          line: textLineByLine.length,
                          column: lastLine.text.length
                      }
        },
        children
    };
}

module.exports = parse;
