// LICENSE : MIT
"use strict";
const assert = require("assert");
const ObjectAssign = require("object-assign");
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
        /*
            FIXME: It is old way and un-document way
            new RuleError("message", index);
         */
        let _backwardCompatibleIndexValue;
        if (typeof padding === "number") {
            _backwardCompatibleIndexValue = padding;
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
            // FIXME: Backward compatible <= textlint.5.5
            throwIfTesting(`Have to use a sets with "line" and "column".
See FAQ: https://github.com/textlint/textlint/blob/master/docs/faq/line-column-or-index.md            

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

        // Not use {column, line} with {index}
        if ((padding.line !== undefined || padding.column !== undefined) && padding.index !== undefined) {
            // Introduced textlint 5.6
            // https://github.com/textlint/textlint/releases/tag/5.6.0
            // Always throw Error
            throw new Error(`Have to use {line, column} or index.
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

        const adjustedLoc = this._adjustLoc(node, padding, _backwardCompatibleIndexValue);
        const adjustedFix = this._adjustFix(node, padding);
        /*
        {
            line,
            column
            fix?
        }
         */
        return ObjectAssign({}, adjustedLoc, adjustedFix);
    }

    _adjustLoc(node, padding, _paddingIndex) {
        const nodeRange = node.range;
        const line = node.loc.start.line;
        const column = node.loc.start.column;

        // when use {index}
        if (padding.index !== undefined || _paddingIndex !== undefined) {
            const startNodeIndex = nodeRange[0];
            const paddingIndex = _paddingIndex || padding.index;
            const position = this.source.indexToPosition(startNodeIndex + paddingIndex);
            return {
                column: position.column,
                line: position.line
            };
        }
        // when use {line, column}
        if (padding.line !== undefined && padding.column !== undefined) {
            if (padding.line > 0) {
                const addedLine = line + padding.line;
                // when report with padding {line, column}, message.column should be 0 + padding.column.
                // In other word, padding line > 0 and message.column start with 0.
                if (padding.column > 0) {
                    return {
                        line: addedLine,
                        column: padding.column
                    };
                } else {
                    return {
                        line: addedLine,
                        column
                    };
                }
            }
        }
        // when use { line }
        if (padding.line !== undefined && padding.line > 0) {
            const addedLine = line + padding.line;
            return {
                line: addedLine,
                column
            };
        }
        // when use { column }
        // FIXME: backward compatible @ un-document
        // Remove next version 6?
        /*
            new RuleError({
                column: index
            });
         */
        if (padding.column !== undefined && padding.column > 0) {
            const addedColumn = column + padding.column;
            return {
                line,
                column: addedColumn
            };
        }

        return {
            column,
            line
        };
    }

    _adjustFix(node, padding) {
        const nodeRange = node.range;
        // if not found `fix`, return empty object
        if (padding.fix === undefined) {
            return {};
        }
        assert(typeof padding.fix === "object", "fix should be FixCommand object");
        return {
            // fix(command) is relative from node's range
            fix: {
                range: [nodeRange[0] + padding.fix.range[0], nodeRange[0] + padding.fix.range[1]],
                text: padding.fix.text
            }
        };
    }
}
