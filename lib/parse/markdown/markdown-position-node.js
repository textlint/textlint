// LICENSE : MIT
"use strict";

// calc node position
// node has to have `start_line`, `start_column, `raw`
/*
    "loc": {
        "start": {
            "line": 2,
            "column": 0
        },
        "end": {
            "line": 2,
            "column": 19
        }
    }
*/
/**
 * compute location from node
 * @param {TxtNode} node
 * @returns {object} location object
 */
module.exports = function (node) {
    if (!(node.start_line && node.start_column && node.raw)) {
        return node;
    }
    var LINEBREAKE_MARK = /\r?\n/g;
    var lines = node.raw.split(LINEBREAKE_MARK);
    var addingColumn = lines.length - 1;
    // https://github.com/Constellation/structured-source
    // say that "
    // Line number starts with 1.
    // Column number starts with 0.
    // "
    // Column number starts with 1 in CommonMark AST.
    var columnMargin = 1;
    var lastLine = lines[addingColumn];
    return {
        loc: {
            start: {
                line: node.start_line,
                column: node.start_column - columnMargin
            },
            end: {
                line: node.start_line + addingColumn,
                column: (addingColumn.length > 0) ? lastLine.length - columnMargin : node.start_column + lastLine.length - columnMargin
            }
        }
    };
};