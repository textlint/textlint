// LICENSE : MIT

// Original code is https://github.com/azer/prettify-error
// Author : azer
"use strict";
import type { TextlintMessage, TextlintResult } from "@textlint/types";
import { FormatterOptions } from "../FormatterOptions.js";

import { styleText, stripVTControlCharacters as stripAnsi } from "node:util";
import { stringWidth } from "../helper/string-width.js";

/**
 * Given a word and a count, append an s if count is not one.
 * @param {string} word A word in its singular form.
 * @param {number} count A number controlling whether word should be pluralized.
 * @returns {string} The original word with an s on the end if count is not one.
 */
function pluralize(word: string, count: number): string {
    return count === 1 ? word : `${word}s`;
}

const summaryColor = "yellow";
const greenColor = "green";
// escape sequences of the colors
const GREY = "\u001B[90m";
const RED = "\u001B[31m";
const RESET = "\u001B[0m";

/**
 *
 * @param {string} code
 * @param {TextLintMessage} message
 * @returns {*}
 */
function failingCode(
    code: string,
    message: TextlintMessage
): Array<{ line: number; code?: string; col?: number; failed?: boolean }> {
    const result = [];
    const lines = code.split("\n");
    let i = message.line - 3;
    while (++i < message.line + 1) {
        if (i + 1 !== message.line) {
            result.push({
                line: message.line - (message.line - i - 1),
                code: lines[i]
            });
            continue;
        }

        result.push({
            line: message.line,
            col: message.column,
            code: lines[i],
            failed: true
        });
    }

    return result;
}

function showColumn(codes: Array<{ line: number; code?: string; col?: number; failed?: boolean }>, ch: string): string {
    let result = "";
    const codeObject = codes[1] as { code: string; col: number };
    const sliced = codeObject.code.slice(0, codeObject.col);
    const width = stringWidth(sliced);
    if (width <= 0) {
        return "";
    }
    let i = width - 1;

    while (i--) {
        result += " ";
    }

    return result + ch;
}

/**
 *
 * @param {string} code
 * @param {string} filePath
 * @param {TextLintMessage} message
 * @returns {*}
 */
function prettyError(code: string, filePath: string, message: TextlintMessage): string | undefined {
    if (!code) {
        return;
    }
    const parsed = failingCode(code, message);
    const previousLineNo = String(parsed[0].line);
    const failingLineNo = String(parsed[1].line);
    const nextLineNo = String(parsed[2].line);
    const linumlen = Math.max(previousLineNo.length, failingLineNo.length, nextLineNo.length);
    const paddingForLineNo = "".padStart(linumlen);
    const previousLine = parsed[0].code ? parsed[0].code : "";
    const nextLine = parsed[2].code ? parsed[2].code : "";
    return (
        `${GREY}${message.ruleId}: ${RED}${message.message}${RESET}\n` +
        `${GREY}${filePath}:${message.line}:${message.column}${RESET}\n` +
        `    ${RED}${paddingForLineNo}  ${showColumn(parsed, "v")}${RESET}\n` +
        `    ${GREY}${previousLineNo.padStart(linumlen)}. ${previousLine}${RESET}\n` +
        `    ${RESET}${failingLineNo.padStart(linumlen)}. ${parsed[1].code}${RESET}\n` +
        `    ${GREY}${nextLineNo.padStart(linumlen)}. ${nextLine}${RESET}\n` +
        `    ${RED}${paddingForLineNo}  ${showColumn(parsed, "^")}${RESET}\n`
    );
}

function prettyErrorWithoutCode(filePath: string, message: TextlintMessage): string {
    return (
        `${GREY}${message.ruleId}: ${RED}${message.message}${RESET}\n` +
        `${GREY}${filePath}:${message.line}:${message.column}${RESET}\n`
    );
}

/**
 *
 * @param {TextLintResult[]} results
 * @param {TextLintFormatterOption} options
 * @returns {string}
 */
function formatter(results: TextlintResult[], options: FormatterOptions) {
    // default: true
    const useColor = options.color !== undefined ? options.color : true;
    let output = "";
    let total = 0;
    let errors = 0;
    let warnings = 0;
    let infos = 0;
    let totalFixable = 0;
    results.forEach(function (result) {
        const messages = result.messages;
        if (messages.length === 0) {
            return;
        }
        // The result does not have the content of the source
        const code = options.getSource(result.filePath);
        total += messages.length;
        messages.forEach(function (message) {
            // fixable
            const fixableIcon = message.fix ? styleText([greenColor, "bold"], "\u2713 ") : "";
            if (message.fix) {
                totalFixable++;
            }
            const fatal = (message as { fatal?: boolean }).fatal;
            if (fatal || message.severity === 2) {
                errors++;
            } else if (message.severity === 1) {
                warnings++;
            } else if (message.severity === 3) {
                infos++;
            } else {
                warnings++;
            }
            // Show the message without the code if the content is not available
            const r =
                code === undefined
                    ? prettyErrorWithoutCode(result.filePath, message)
                    : prettyError(code, result.filePath, message);
            if (r) {
                output += `${fixableIcon}${r}\n`;
            }
        });
    });

    if (total > 0) {
        const problemParts = [];
        if (errors > 0) {
            problemParts.push(`${errors} ${pluralize("error", errors)}`);
        }
        if (warnings > 0) {
            problemParts.push(`${warnings} ${pluralize("warning", warnings)}`);
        }
        if (infos > 0) {
            problemParts.push(`${infos} ${pluralize("info", infos)}`);
        }

        output += styleText(
            [summaryColor, "bold"],
            ["\u2716 ", total, pluralize(" problem", total), " (", problemParts.join(", "), ")\n"].join("")
        );
    }

    if (totalFixable > 0) {
        output += styleText([greenColor, "bold"], `✓ ${totalFixable} fixable ${pluralize("problem", totalFixable)}.\n`);
        output += `Try to run: $ ${styleText("underline", "textlint --fix [file]")}\n`;
    }

    if (!useColor) {
        return stripAnsi(output);
    }
    return output;
}

export default formatter;
export { prettyError };
