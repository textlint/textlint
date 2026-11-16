/**
 * @fileoverview Stylish reporter
 * @author Sindre Sorhus
 */

"use strict";
import type { TextlintResult } from "@textlint/types";
import { FormatterOptions } from "../FormatterOptions.js";

import { styleText, stripVTControlCharacters as stripAnsi } from "node:util";
import { alignColumns } from "../helper/align-columns.js";
//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Create a function that returns the same text as `styleText(format, text)`.
 * `styleText` checks the output stream on every call. The created function checks it once,
 * and puts the text between the codes that `styleText` puts around a text.
 * A text that has an escape sequence is passed to `styleText`, because it may treat the sequences in the text.
 */
function createStyler(format: Parameters<typeof styleText>[0]): (text: string) => string {
    const placeholder = "\u0000";
    const parts = styleText(format, placeholder).split(placeholder);
    if (parts.length !== 2) {
        return (text) => styleText(format, text);
    }
    const [open, close] = parts;
    return (text) => (text.includes("\u001b") ? styleText(format, text) : open + text + close);
}

/**
 * Given a word and a count, append an s if count is not one.
 * @param {string} word A word in its singular form.
 * @param {int} count A number controlling whether word should be pluralized.
 * @returns {string} The original word with an s on the end if count is not one.
 */
function pluralize(word: string, count: number): string {
    return count === 1 ? word : `${word}s`;
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

function formatter(results: TextlintResult[], options: FormatterOptions) {
    // default: true
    const useColor = options.color !== undefined ? options.color : true;

    let output = "\n";
    let total = 0;
    let totalFixable = 0;
    let errors = 0;
    let warnings = 0;
    let infos = 0;
    let summaryColor = "yellow" as "yellow" | "red";
    const greenColor = "green";
    // `styleText` checks the output stream on every call, so the texts that are the same for all messages are styled once
    const fixableIconText = styleText([greenColor, "bold"], "\u2713 ");
    const errorText = styleText("red", "error");
    const warningText = styleText("yellow", "warning");
    const infoText = styleText("green", "info");
    const gray = createStyler("gray");

    results.forEach(function (result) {
        const messages = result.messages;

        if (messages.length === 0) {
            return;
        }

        total += messages.length;
        output += `${styleText("underline", result.filePath)}\n`;

        output += `${alignColumns(
            messages.map(function (message) {
                let messageType;
                // fixable
                const fixableIcon = message.fix ? fixableIconText : "";
                if (message.fix) {
                    totalFixable++;
                }
                const fatal = (message as { fatal?: boolean }).fatal;
                if (fatal || message.severity === 2) {
                    messageType = fixableIcon + errorText;
                    summaryColor = "red";
                    errors++;
                } else if (message.severity === 1) {
                    messageType = fixableIcon + warningText;
                    warnings++;
                } else if (message.severity === 3) {
                    messageType = fixableIcon + infoText;
                    infos++;
                } else {
                    // fallback for other severity levels
                    messageType = fixableIcon + warningText;
                    warnings++;
                }

                return [
                    "",
                    message.line || 0,
                    message.column || 0,
                    messageType,
                    message.message.replace(/\.$/, ""),
                    gray(message.ruleId || "")
                ];
            }),
            ["", "r", "l"]
        )
            .split("\n")
            .map(function (el: string) {
                return el.replace(/(\d+)\s+(\d+)/, function (_, p1, p2) {
                    return gray(`${p1}:${p2}`);
                });
            })
            .join("\n")}\n\n`;
    });

    if (total > 0) {
        const summaryParts = [
            `${errors} ${pluralize("error", errors)}`,
            `${warnings} ${pluralize("warning", warnings)}`,
            `${infos} ${pluralize("info", infos)}`
        ];
        output += styleText(
            [summaryColor, "bold"],

            ["\u2716 ", total, pluralize(" problem", total), " (", summaryParts.join(", "), ")\n"].join("")
        );
    }

    if (totalFixable > 0) {
        output += styleText([greenColor, "bold"], `✓ ${totalFixable} fixable ${pluralize("problem", totalFixable)}.\n`);
        output += `Try to run: $ ${styleText("underline", "textlint --fix [file]")}\n`;
    }

    const finalOutput = total > 0 ? output : "";
    if (!useColor) {
        return stripAnsi(finalOutput);
    }
    return finalOutput;
}

export default formatter;
