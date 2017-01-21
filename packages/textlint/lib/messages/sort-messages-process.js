// LICENSE : MIT
"use strict";
/**
 * sort messages by line and column
 * @param {TextLintMessage[]} messages
 * @returns {TextLintMessage[]}
 */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = sortByLineColumn;
function sortByLineColumn(messages) {
    // sort by line and column
    return messages.sort(function (a, b) {
        var lineDiff = a.line - b.line;
        if (lineDiff === 0) {
            return a.column - b.column;
        } else {
            return lineDiff;
        }
    });
}
//# sourceMappingURL=sort-messages-process.js.map