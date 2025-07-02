"use strict";
import type { TextlintFixResult } from "@textlint/types";
import * as fs from "node:fs";
import { diffLines } from "diff";
import chalk from "chalk";
import stripAnsi from "strip-ansi";

type DiffPart = {
    value: string;
    count?: number;
    added?: boolean;
    removed?: boolean;
};
const isFile = (filePath: string) => {
    try {
        const stats = fs.statSync(filePath);
        return stats.isFile();
    } catch (error) {
        return false;
    }
};
/**
 * Given a word and a count, append an s if count is not one.
 * @param {string} word A word in its singular form.
 * @param {number} count A number controlling whether word should be pluralized.
 * @returns {string} The original word with an s on the end if count is not one.
 */
function pluralize(word: string, count: number): string {
    return count === 1 ? word : `${word}s`;
}

function isModified(part: DiffPart): boolean {
    if (!part) {
        return false;
    }
    return typeof part === "object" && part !== null && (!!part.removed || !!part.added);
}

function addMarkEachLine(mark: string, text: string) {
    if (text.length === 0) {
        return "\n";
    }
    const lines = text.split("\n");
    const markedLines = lines
        .filter((line: string) => line.length > 0)
        .map((line: string) => {
            return mark + line;
        });
    return `${markedLines.join("\n")}\n`;
}

export default function (results: TextlintFixResult[], options: { color?: boolean } = {}) {
    // default: true
    const useColor = options.color !== undefined ? options.color : true;
    let output = "\n";
    let totalFixed = 0;
    let errors = 0;
    const summaryColor = "yellow";
    const greenColor = "green";

    results.forEach(function (result) {
        const filePath = result.filePath;
        const messages = result.applyingMessages;
        // still error count
        const remainingMessages = result.remainingMessages;
        errors += remainingMessages.length;
        totalFixed += messages.length;
        if (messages.length === 0) {
            return;
        }
        if (!isFile(filePath)) {
            return;
        }
        output += `${chalk.underline(result.filePath)}\n`;

        const originalContent = fs.readFileSync(filePath, "utf-8");
        const diff = diffLines(originalContent, result.output);

        diff.forEach(function (part: DiffPart, index: number) {
            const prevLine = diff[index - 1] as DiffPart;
            const nextLine = diff[index + 1] as DiffPart;
            if (!isModified(part) && (part.count ?? 0) > 1) {
                const greyColor = "grey";
                /*
                    <MODIFIED>
                    first line
                    ....
                 */
                if (isModified(prevLine)) {
                    const lines = part.value.split("\n");
                    output += `${chalk[greyColor](lines[0])}\n`;
                }
                output += chalk[greyColor]("...");
                if (isModified(nextLine)) {
                    const lines = part.value.split("\n");
                    output += `${chalk[greyColor](lines[lines.length - 1])}\n`;
                }
                /*
                    ...
                    last line
                    <MODIFIED>
                 */
                return;
            }
            // green for additions, red for deletions
            // grey for common parts
            let lineColor: "green" | "red" | "grey";
            let diffMark = "";
            if (part.added) {
                lineColor = "green";
                diffMark = "+ ";
            } else if (part.removed) {
                lineColor = "red";
                diffMark = "- ";
            } else {
                lineColor = "grey";
                diffMark = "";
            }
            output += chalk[lineColor](addMarkEachLine(diffMark, part.value));
        });
        output += "\n\n";
    });

    if (totalFixed > 0) {
        output += chalk[greenColor].bold(
            [
                // http://www.fileformat.info/info/unicode/char/2714/index.htm
                "✔ Fixed ",
                totalFixed,
                pluralize(" problem", totalFixed),
                "\n"
            ].join("")
        );
    }

    if (errors > 0) {
        output += chalk[summaryColor].bold(
            [
                // http://www.fileformat.info/info/unicode/char/2716/index.htm
                "✖ Remaining ",
                errors,
                pluralize(" problem", errors),
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
