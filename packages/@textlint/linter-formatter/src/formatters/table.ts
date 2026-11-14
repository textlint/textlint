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

import { table } from "table";

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
    const rows: (string | number)[][] = [];

    if (messages.length === 0) {
        return "";
    }

    rows.push([
        styleText("bold", "Line"),
        styleText("bold", "Column"),
        styleText("bold", "Type"),
        styleText("bold", "Message"),
        styleText("bold", "Rule ID")
    ]);

    messages.forEach(function (message: TextlintMessage) {
        let messageType;
        const fatal = (message as { fatal?: boolean }).fatal;

        if (fatal || message.severity === 2) {
            messageType = styleText("red", "error");
        } else if (message.severity === 1) {
            messageType = styleText("yellow", "warning");
        } else if (message.severity === 3) {
            messageType = styleText("green", "info");
        } else {
            messageType = styleText("yellow", "warning");
        }

        rows.push([message.line || 0, message.column || 0, messageType, message.message, message.ruleId || ""]);
    });

    const output = table(rows, {
        columns: {
            0: {
                width: 8,
                wrapWord: true
            },
            1: {
                width: 8,
                wrapWord: true
            },
            2: {
                width: 8,
                wrapWord: true
            },
            3: {
                paddingRight: 5,
                width: 50,
                wrapWord: true
            },
            4: {
                width: 20,
                wrapWord: true
            }
        },
        drawHorizontalLine(index: number) {
            return index === 1;
        }
    });
    return output;
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

    const tableData = [];
    if (errorCount > 0) {
        tableData.push([styleText("red", `${errorCount} ${pluralize("Error", errorCount)}`)]);
    }
    if (warningCount > 0) {
        tableData.push([styleText("yellow", `${warningCount} ${pluralize("Warning", warningCount)}`)]);
    }
    if (infoCount > 0) {
        tableData.push([styleText("green", `${infoCount} ${pluralize("Info", infoCount)}`)]);
    }

    if (tableData.length > 0) {
        output += `\n${table(tableData, {
            columns: {
                0: {
                    width: 110,
                    wrapWord: true
                }
            },
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
