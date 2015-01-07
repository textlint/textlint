// LICENSE : MIT
"use strict";

// location information example:
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

var CMSyntax = require("./mapping/common-markdown-syntax");
/**
 * Compute location info from node position and `raw` value.
 * if the computation is success, then return location object.
 * if the computation is failure, then return node of arguments.
 * @param {TxtNode} node  node has to have `start_line`, `start_column, `raw`
 * @returns {object} location object
 */
module.exports = function (node) {
    if (typeof node.start_line === "undefined" ||
        typeof node.start_column === "undefined" ||
        typeof node.raw === "undefined") {
        return node;
    }
    var LINEBREAKE_MARK = /\r?\n/g;
    var lines = node.raw.split(LINEBREAKE_MARK);
    var addingColumn = lines.length - 1;


    // https://github.com/Constellation/structured-source
    // say that
    // > Line number starts with 1.
    // > Column number starts with 0.
    // But, Column number must starts with 1 in CommonMark AST.
    // => CommonMark's column number - 1.
    var columnMargin = 1;
    var lastLine = lines[addingColumn];
    // location info
    var loc = {};


    var end_column;
    if (addingColumn > 0) {
        end_column = Math.max(lastLine.length , 0);
    } else {
        end_column = Math.max(node.start_column + lastLine.length - columnMargin, 0);
    }
    // if FencedCode
    if (node.t === CMSyntax.CodeBlock && typeof node.info !== "undefined") {
        /*
            ```
            start - end
            ```
         */
        loc["start"] = {
            line: node.start_line + 1,
            column: node.start_column - columnMargin
        };
        loc["end"] = {
            line: node.start_line + addingColumn + 1,
            column: end_column
        };
    } else {
        loc["start"] = {
            line: node.start_line,
            column: node.start_column - columnMargin
        };
        loc["end"] = {
            line: node.start_line + addingColumn,
            column: end_column
        };
    }

    return {loc: loc};
};