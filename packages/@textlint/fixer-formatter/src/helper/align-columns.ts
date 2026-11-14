import { stripVTControlCharacters } from "node:util";
import { stringWidth } from "./string-width.js";

/**
 * The width of the longest line of the text
 */
const maxLineWidth = (text: string): number => {
    return Math.max(...stripVTControlCharacters(text).split("\n").map(stringWidth));
};

/**
 * Align the columns of the rows with spaces, and join the columns with two spaces.
 * The trailing whitespaces of each row are removed with `trimEnd`.
 * A cell can have escape sequences and fullwidth characters.
 *
 * It is compatible with `text-table` package with the `stringLength` option that uses `stringWidth`.
 * https://www.npmjs.com/package/text-table
 *
 * @param rows rows of the cells
 * @param align "r" aligns the column to the right. Otherwise, the column is aligned to the left
 */
export const alignColumns = (rows: (string | number)[][], align: string[] = []): string => {
    const textRows = rows.map((row) => row.map((cell) => String(cell)));
    const columnWidths: number[] = [];
    for (const row of textRows) {
        row.forEach((cell, index) => {
            columnWidths[index] = Math.max(columnWidths[index] ?? 0, maxLineWidth(cell));
        });
    }
    return textRows
        .map((row) => {
            return row
                .map((cell, index) => {
                    const space = " ".repeat(Math.max(columnWidths[index] - maxLineWidth(cell), 0));
                    return align[index] === "r" ? space + cell : cell + space;
                })
                .join("  ")
                .trimEnd();
        })
        .join("\n");
};
