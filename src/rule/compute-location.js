// LICENSE : MIT
"use strict";
/**
 * compute node's location with error's padding location.
 *
 * @param {TxtNode} node
 * @param {RuleError} padding
 * @returns {{line: number, column: number}}
 */
export default function computeLocation(node, padding) {
    let line = node.loc.start.line;
    let column = node.loc.start.column;
    if (padding.line > 0) {
        line += padding.line;
        // hen report with padding {line, column}, message.column should be 0 + padding.column.
        // In other word, padding line > 0 and message.column start with 0.
        if (padding.column) {
            // means 0 + padding column
            column = padding.column;
        }
    } else {
        if (padding.column) {
            column += padding.column;
        }
    }
    return {
        line,
        column
    };
};