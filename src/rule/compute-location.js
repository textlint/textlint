// LICENSE : MIT
"use strict";
/**
 * compute node's location with error's padding location.
 *
 * @param {TxtNode} node
 * @param {RuleError} padding
 * @returns {{line: number, column: number, fix?: FixCommand}}
 */
export default function computeLocation(node, padding) {
    const nodeRange = node.range;
    let line = node.loc.start.line;
    let column = node.loc.start.column;
    if (padding.line > 0) {
        line += padding.line;
        // when report with padding {line, column}, message.column should be 0 + padding.column.
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
    // fix(command) is relative from node's range
    if (padding.fix) {
        const fix = {
            range: [nodeRange[0] + padding.fix.range[0], nodeRange[0] + padding.fix.range[1]],
            text: padding.fix.text
        };
        return {
            line,
            column,
            fix
        };
    }
    return {
        line,
        column
    };
}