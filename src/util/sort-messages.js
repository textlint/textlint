// LICENSE : MIT
"use strict";
export default function sortByLineColumn(messages) {
    // sort by line and column
    return messages.sort(function (a, b) {
        const lineDiff = a.line - b.line;
        if (lineDiff === 0) {
            return a.column - b.column;
        } else {
            return lineDiff;
        }
    });
}
