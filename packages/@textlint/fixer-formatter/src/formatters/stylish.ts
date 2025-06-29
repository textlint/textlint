"use strict";
import type { TextlintFixResult } from "@textlint/types";

import chalk from "chalk";
// @ts-expect-error no types
import table from "text-table";
import widthOfString from "string-width";
import stripAnsi from "strip-ansi";

/**
 * Given a word and a count, append an s if count is not one.
 * @param {string} word A word in its singular form.
 * @param {number} count A number controlling whether word should be pluralized.
 * @returns {string} The original word with an s on the end if count is not one.
 */
function pluralize(word: string, count: number): string {
    return count === 1 ? word : `${word}s`;
}

export default function (results: TextlintFixResult[], options: { color?: boolean }) {
    // default: true
    const useColor = options.color !== undefined ? options.color : true;
    let output = "\n";
    let totalFixed = 0;
    let errors = 0;
    let warnings = 0;
    let infos = 0;
    const summaryColor = "yellow";
    const greenColor = "green";

    results.forEach(function (result) {
        if (!result.applyingMessages || !result.remainingMessages) {
            return;
        }
        const messages = result.applyingMessages;
        // still error count
        const remainingMessages = result.remainingMessages;

        // Count remaining messages by severity
        remainingMessages.forEach(function (message) {
            const fatal = (message as { fatal?: boolean }).fatal;
            if (fatal || message.severity === 2) {
                errors++;
            } else if (message.severity === 1) {
                warnings++;
            } else if (message.severity === 3) {
                infos++;
            }
        });

        if (messages.length === 0) {
            return;
        }
        output += `${chalk.underline(result.filePath)}\n`;

        output += `${table(
            messages.map(function (message) {
                // fixable
                totalFixed++;
                const messageType = chalk[greenColor].bold("\u2714 ");

                return [
                    "",
                    message.line || 0,
                    message.column || 0,
                    messageType,
                    message.message.replace(/\.$/, ""),
                    chalk.gray(message.ruleId || "")
                ];
            }),
            {
                align: ["", "r", "l"],
                stringLength: (str: string) => {
                    const lines = stripAnsi(str).split("\n");
                    return Math.max.apply(
                        null,
                        lines.map(function (line: string) {
                            return widthOfString(line);
                        })
                    );
                }
            }
        )
            .split("\n")
            .map(function (el: string) {
                return el.replace(/(\d+)\s+(\d+)/, function (_m, p1, p2) {
                    return chalk.gray(`${p1}:${p2}`);
                });
            })
            .join("\n")}\n\n`;
    });

    if (totalFixed > 0) {
        output += chalk[greenColor].bold(
            [
                // http://www.fileformat.info/info/unicode/char/2714/index.htm
                "\u2714 Fixed ",
                totalFixed,
                pluralize(" problem", totalFixed),
                "\n"
            ].join("")
        );
    }

    const totalRemaining = errors + warnings + infos;
    if (totalRemaining > 0) {
        const summaryParts = [
            `${errors} ${pluralize("error", errors)}`,
            `${warnings} ${pluralize("warning", warnings)}`,
            `${infos} ${pluralize("info", infos)}`
        ];
        output += chalk[summaryColor].bold(
            [
                // http://www.fileformat.info/info/unicode/char/2716/index.htm
                "\u2716 Remaining ",
                summaryParts.join(", "),
                "\n"
            ].join("")
        );
    }

    const finalOutput = totalFixed > 0 ? output : "";
    if (!useColor) {
        return stripAnsi(finalOutput);
    }
    return finalOutput;
}
