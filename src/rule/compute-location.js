// LICENSE : MIT
"use strict";
/**
 *
 * @param node
 * @param padding
 * @returns {{line: number, column: number}}
 */
export default function computeLocation(node, padding) {
    let line = node.loc.start.line;
    let column = node.loc.start.column;
    if (padding.line > 0) {
        line += padding.line;
        // when has padding line, column start with 0.
        if (padding.column) {
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
    }
}