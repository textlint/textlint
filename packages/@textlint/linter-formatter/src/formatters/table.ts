/**
 * @fileoverview "table reporter.
 * @author Gajus Kuizinas <gajus@gajus.com>
 * @copyright 2016 Gajus Kuizinas <gajus@gajus.com>. All rights reserved.
 */

"use strict";
import type { TextlintMessage, TextlintResult } from "@textlint/types";
import { FormatterOptions } from "../FormatterOptions.js";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import { styleText, stripVTControlCharacters as stripAnsi } from "node:util";

import { drawTable as drawBorderedTable, type TableCell } from "../helper/draw-table.js";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Given a word and a count, append an s if count is not one.
 * @param {string} word A word in its singular form.
 * @param {number} count A number controlling whether word should be pluralized.
 * @returns {string} The original word with an s on the end if count is not one.
 */
function pluralize(word: string, count: number): string {
    return count === 1 ? word : `${word}s`;
}

/**
 * Draws text table.
 * @param {Array<Object>} messages Error messages relating to a specific file.
 * @returns {string} A text table.
 */
function drawTable(messages: TextlintMessage[]): string {
    const rows: TableCell[][] = [];

    if (messages.length === 0) {
        return "";
    }

    const bold = (text: string) => styleText("bold", text);
    rows.push(
        ["Line", "Column", "Type", "Message", "Rule ID"].map((text) => {
            return { text, style: bold };
        })
    );

    messages.forEach(function (message: TextlintMessage) {
        let messageType: TableCell;
        const fatal = (message as { fatal?: boolean }).fatal;

        if (fatal || message.severity === 2) {
            messageType = { text: "error", style: (text) => styleText("red", text) };
        } else if (message.severity === 3) {
            messageType = { text: "info", style: (text) => styleText("green", text) };
        } else {
            messageType = { text: "warning", style: (text) => styleText("yellow", text) };
        }

        rows.push([
            { text: String(message.line || 0) },
            { text: String(message.column || 0) },
            messageType,
            // A cell should not include escape sequences. The table can not wrap the text in an escape sequence
            { text: stripAnsi(message.message) },
            { text: stripAnsi(message.ruleId || "") }
        ]);
    });

    return drawBorderedTable(rows, {
        columns: [{ width: 8 }, { width: 8 }, { width: 8 }, { width: 50, paddingRight: 5 }, { width: 20 }],
        drawHorizontalLine(index: number) {
            return index === 1;
        }
    });
}

/**
 * Draws a report (multiple tables).
 * @param {Array} results Report results for every file.
 * @returns {string} A column of text tables.
 */
function drawReport(results: TextlintResult[]): string {
    let files;

    files = results.map(function (result: TextlintResult) {
        if (!result.messages.length) {
            return "";
        }

        return `\n${result.filePath}\n\n${drawTable(result.messages)}`;
    });

    files = files.filter(function (content: string) {
        return content.trim();
    });

    return files.join("");
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

function formatter(report: TextlintResult[], options: FormatterOptions) {
    // default: true
    const useColor = options.color !== undefined ? options.color : true;
    let output = "";
    let errorCount = 0;
    let warningCount = 0;
    let infoCount = 0;

    report.forEach(function (fileReport: TextlintResult) {
        fileReport.messages.forEach(function (message: TextlintMessage) {
            const fatal = (message as { fatal?: boolean }).fatal;
            if (fatal || message.severity === 2) {
                errorCount++;
            } else if (message.severity === 1) {
                warningCount++;
            } else if (message.severity === 3) {
                infoCount++;
            }
        });
    });

    if (errorCount || warningCount || infoCount) {
        output = drawReport(report);
    }

    const summaryRows: TableCell[][] = [];
    if (errorCount > 0) {
        summaryRows.push([
            { text: `${errorCount} ${pluralize("Error", errorCount)}`, style: (text) => styleText("red", text) }
        ]);
    }
    if (warningCount > 0) {
        summaryRows.push([
            {
                text: `${warningCount} ${pluralize("Warning", warningCount)}`,
                style: (text) => styleText("yellow", text)
            }
        ]);
    }
    if (infoCount > 0) {
        summaryRows.push([
            { text: `${infoCount} ${pluralize("Info", infoCount)}`, style: (text) => styleText("green", text) }
        ]);
    }

    if (summaryRows.length > 0) {
        output += `\n${drawBorderedTable(summaryRows, {
            columns: [{ width: 110 }],
            drawHorizontalLine() {
                return true;
            }
        })}`;
    }

    if (!useColor) {
        return stripAnsi(output);
    }
    return output;
}

export default formatter;
