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

/**
 * Escape a value used as the data part of a GitHub Actions workflow command.
 * Without this, a newline in the value could start a new (forged) workflow command.
 * @see https://github.com/actions/toolkit/blob/main/packages/core/src/command.ts
 */
function escapeData(value: string): string {
    return value.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
}

/**
 * Escape a value used as a property (e.g. `file=`, `title=`) of a GitHub Actions workflow command.
 * @see https://github.com/actions/toolkit/blob/main/packages/core/src/command.ts
 */
function escapeProperty(value: string): string {
    return escapeData(value).replace(/:/g, "%3A").replace(/,/g, "%2C");
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

function formatter(results: TextlintResult[]) {
    let output = "";

    results.forEach(function (result) {
        const messages = result.messages;

        if (messages.length === 0) {
            return;
        }

        output += `::group::${escapeData(result.filePath)}\n`;

        // ::warning file={name},line={line},endLine={endLine},title={title}::{message} is the format used by github to generate annotations
        messages.forEach(function (message) {
            output += `::${getMessageType(message)} `;
            output += `file=${escapeProperty(result.filePath)},`;
            output += `line=${message.loc.start.line || 1},`;
            output += `endLine=${message.loc.end.line || message.loc.start.line || 1},`;
            output += `col=${message.loc.start.column || 1},`;
            output += `endColumn=${message.loc.end.column || message.loc.start.column || 1},`;
            output += `title=${escapeProperty(`TextLint${message.ruleId ? ` [${message.ruleId}]` : ""}`)}::`;
            output += `${escapeData(message.message.trim())}`;
            output += ` | ${message.loc.start.line || 1}:`;
            output += `${message.loc.start.column || 1}`;
            output += "\n";
        });
        output += "::endgroup::\n";
    });

    return output;
}

export default formatter;
