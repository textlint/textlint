// LICENSE : MIT
"use strict";
import {throwIfTesting} from "../util/throw-log";
export default class SourceLocation {
    /**
     *
     * @param {SourceCode} source
     */
    constructor(source) {
        this.source = source;
    }

    /**
     * adjust node's location with error's padding location.
     *
     * @param {TxtNode} node
     * @param {RuleError} padding
     * @returns {{line: number, column: number, fix?: FixCommand}}
     */
    adjust(node, padding) {
        const nodeRange = node.range;
        let line = node.loc.start.line;
        let column = node.loc.start.column;
        /*
            FIXME: It is old way and un-document way
            new RuleError("message", index);
         */
        let _paddingIndex;
        if (typeof padding === "number") {
            _paddingIndex = padding;
            throwIfTesting(`This is un-document way:
report(node, new RuleError("message", index);

Please use { index }: 

report(node, new RuleError("message", {
    index: paddingLineColumn
});
`);
        }
        // when running from textlint-tester, assert
        if (padding.line === undefined && padding.column !== undefined) {
            throwIfTesting(`Have to use a sets with "line" and "column".
report(node, new RuleError("message", {
    line: paddingLineNumber,
    column: paddingLineColumn
});

OR use "index" property insteadof only "column".

report(node, new RuleError("message", {
    index: paddingLineColumn
});
`);
        }

        // line and column OR index
        if ((padding.line !== undefined || padding.column !== undefined) && padding.index !== undefined) {
            throwIfTesting(`Have to use {line, column} or index.
=> use either one of the two

report(node, new RuleError("message", {
    line: paddingLineNumber,
    column: paddingLineColumn
});

OR use "index" property

report(node, new RuleError("message", {
    index: paddingIndexValue
});
`);
        }

        // use {index}
        if (padding.index !== undefined || _paddingIndex !== undefined) {
            const startNodeIndex = nodeRange[0];
            const paddingIndex = _paddingIndex || padding.index;
            const position = this.source.indexToPosition(startNodeIndex + paddingIndex);
            column = position.column;
            line = position.line;
        } else {
            // use {line, column}
            if (padding.line > 0) {
                line += padding.line;
                // when report with padding {line, column}, message.column should be 0 + padding.column.
                // In other word, padding line > 0 and message.column start with 0.
                if (padding.column) {
                    // means 0 + padding column
                    column = padding.column;
                }
            } else {
                // FIXME: backward compatible @ un-document
                // Remove next version 6?
                /*
                    new RuleError({
                        column: index
                    });
                 */
                if (padding.column) {
                    column += padding.column;
                }
            }
        }

        if (!padding.fix) {
            return {
                line,
                column
            };
        }
        // fix(command) is relative from node's range
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
}