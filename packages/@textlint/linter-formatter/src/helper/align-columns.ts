import { stripVTControlCharacters } from "node:util";
import { stringWidth } from "./string-width.js";

/**
 * The width of the longest line of the text
 */
const maxLineWidth = (text: string): number => {
    const plainText = stripVTControlCharacters(text);
    if (!plainText.includes("\n")) {
        return stringWidth(plainText);
    }
    return Math.max(...plainText.split("\n").map(stringWidth));
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
    // The width of each cell is used for the width of the column and for the padding, so it is measured once.
    // The same text often appears in many rows, such as a rule id, so the width of a text is kept during this call.
    const widthByText = new Map<string, number>();
    const widthOf = (cell: string): number => {
        let width = widthByText.get(cell);
        if (width === undefined) {
            width = maxLineWidth(cell);
            widthByText.set(cell, width);
        }
        return width;
    };
    const columnWidths: number[] = [];
    const cellWidths = textRows.map((row) => {
        return row.map((cell, index) => {
            const width = widthOf(cell);
            columnWidths[index] = Math.max(columnWidths[index] ?? 0, width);
            return width;
        });
    });
    return textRows
        .map((row, rowIndex) => {
            const widths = cellWidths[rowIndex];
            return row
                .map((cell, index) => {
                    const space = " ".repeat(Math.max(columnWidths[index] - widths[index], 0));
                    return align[index] === "r" ? space + cell : cell + space;
                })
                .join("  ")
                .trimEnd();
        })
        .join("\n");
};
