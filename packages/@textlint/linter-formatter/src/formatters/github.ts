/**
 * @fileoverview github-style formatter.
 * @author thompson-tomo
 * @copyright 2015 James Thompson 2025. All rights reserved.
 */

"use strict";
import type { TextlintResult } from "@textlint/types";

//------------------------------------------------------------------------------
// Helper Functions
//------------------------------------------------------------------------------

/**
 * Returns a canonical error level string based upon the error message passed in.
 * @param {object} message Individual error message provided by eslint
 * @returns {String} Error level string
 */
function getMessageType(message: { fatal?: boolean; severity: number }): string {
    if (message.fatal || message.severity === 2) {
        return "error";
    } else if (message.severity === 1) {
        return "warning";
    } else if (message.severity === 3) {
        return "notice";
    } else {
        return "warning";
    }
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

function formatter(results: TextlintResult[]) {
    let output = "";

    results.forEach(function (result) {
        const messages = result.messages;

        // ::warning file={name},line={line},endLine={endLine},title={title}::{message}
        messages.forEach(function (message) {
            output += `::${getMessageType(message)} `;
            output += `file=${result.filePath},`;
            output += `line=${message.loc.start.line || 1},`;
            output += `endLine=${message.loc.end.line || message.loc.start.line || 1},`;
            output += `col=${message.loc.start.column || 1},`;
            output += `endColumn=${message.loc.end.column || message.loc.start.column || 1},`;
            output += `title=TextLint${message.ruleId ? `->${message.ruleId}` : ""}::`;
            output += `${message.message.trim()}`;
            output += "\n";
        });
    });

    return output.trimEnd();
}

export default formatter;
