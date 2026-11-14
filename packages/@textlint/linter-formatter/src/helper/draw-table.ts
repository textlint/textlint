import { stringWidth } from "@textlint/utils";

/**
 * Draw a table with borders.
 *
 * ```
 * ╔══════╤════════╗
 * ║ Line │ Column ║
 * ╟──────┼────────╢
 * ║ 1    │ 8      ║
 * ╚══════╧════════╝
 * ```
 *
 * The layout is compatible with the default layout of `table` package: https://github.com/gajus/table
 */
export type TableCell = {
    /**
     * The text of the cell. The text should not include escape sequences.
     * A text that is longer than the width of the column is wrapped at a word boundary.
     */
    text: string;
    /**
     * Decorate each line of the cell. For example, add colors.
     * The function should not change the width of the line.
     */
    style?: (line: string) => string;
};
export type TableColumn = {
    /**
     * The number of the terminal columns for the text
     */
    width: number;
    /**
     * Default: 1
     */
    paddingRight?: number;
};
export type DrawTableOptions = {
    columns: TableColumn[];
    /**
     * Return true to draw the horizontal line.
     * The index is `0` for the top border, `rowCount` for the bottom border, and `n` for the line before the row `n`.
     */
    drawHorizontalLine: (index: number, rowCount: number) => boolean;
};

const PADDING_LEFT = 1;
const DEFAULT_PADDING_RIGHT = 1;
/**
 * A user-perceived character: a code point with the combining marks, variation selectors, emoji modifiers and
 * tag characters attached to it, including zero-width joiner emoji sequences; or a pair of regional indicators.
 */
const GRAPHEME_PATTERN =
    /\p{Regional_Indicator}{2}|[\s\S][\p{M}\p{Emoji_Modifier}\u{E0020}-\u{E007F}]*(?:‍[\s\S][\p{M}\p{Emoji_Modifier}\u{E0020}-\u{E007F}]*)*/gu;

type Grapheme = {
    value: string;
    /**
     * The number of the terminal columns. It is at least one for wrapping
     */
    columns: number;
};
const splitGraphemes = (text: string): Grapheme[] => {
    return (text.match(GRAPHEME_PATTERN) ?? []).map((value) => {
        return {
            value,
            columns: Math.max(stringWidth(value), 1)
        };
    });
};

/**
 * Wrap a line into lines of `width` terminal columns at most.
 * It breaks the line after whitespaces or one of `\ / _ . , ; -`.
 * If there is no place to break, it breaks the line at `width`.
 */
export const wrapWord = (line: string, width: number): string[] => {
    const graphemes = splitGraphemes(line);
    const breakPattern = new RegExp(
        `(^.{1,${Math.max(width, 1)}}(\\s+|$))|(^.{1,${Math.max(width - 1, 1)}}(\\\\|/|_|\\.|,|;|-))`
    );
    // The subject has a character per terminal column.
    // A single code unit stands for itself, so that whitespaces and break characters keep their meaning in the pattern
    let subject = graphemes
        .map((grapheme) => (grapheme.value.length === 1 ? grapheme.value : "x").repeat(grapheme.columns))
        .join("");
    let index = 0;
    const consume = (columns: number): string => {
        let text = "";
        let remainingColumns = columns;
        while (remainingColumns > 0 && index < graphemes.length) {
            remainingColumns -= graphemes[index].columns;
            text += graphemes[index].value;
            index += 1;
        }
        return text;
    };
    const lines: string[] = [];
    do {
        const match = breakPattern.exec(subject);
        let lineColumns: number;
        let chunkColumns: number;
        if (match) {
            chunkColumns = match[0].length;
            lineColumns = match[0].trimEnd().length;
        } else {
            // No place to break: take graphemes as many as the width, and one grapheme at least
            lineColumns = index < graphemes.length ? graphemes[index].columns : 0;
            for (
                let next = index + 1;
                next < graphemes.length && lineColumns + graphemes[next].columns <= Math.max(width, 1);
                next += 1
            ) {
                lineColumns += graphemes[next].columns;
            }
            chunkColumns = lineColumns;
        }
        lines.push(consume(lineColumns));
        // skip the whitespaces after the line
        consume(chunkColumns - lineColumns);
        subject = subject.slice(chunkColumns);
    } while (subject.length > 0);
    return lines;
};

const wrapCell = (text: string, width: number): string[] => {
    return text
        .replace(/\r\n/g, "\n")
        .split("\n")
        .flatMap((line) => wrapWord(line, width));
};

const drawBorder = (columnWidths: number[], border: { left: string; body: string; join: string; right: string }) => {
    return `${border.left}${columnWidths.map((width) => border.body.repeat(width)).join(border.join)}${border.right}\n`;
};

export const drawTable = (rows: TableCell[][], options: DrawTableOptions): string => {
    const columns = options.columns.map((column) => {
        return {
            width: column.width,
            paddingRight: column.paddingRight ?? DEFAULT_PADDING_RIGHT
        };
    });
    const columnWidths = columns.map((column) => PADDING_LEFT + column.width + column.paddingRight);
    const rowCount = rows.length;
    let output = "";
    if (options.drawHorizontalLine(0, rowCount)) {
        output += drawBorder(columnWidths, { left: "╔", body: "═", join: "╤", right: "╗" });
    }
    rows.forEach((row, rowIndex) => {
        if (rowIndex > 0 && options.drawHorizontalLine(rowIndex, rowCount)) {
            output += drawBorder(columnWidths, { left: "╟", body: "─", join: "┼", right: "╢" });
        }
        const cellLines = row.map((cell, columnIndex) => wrapCell(cell.text, columns[columnIndex].width));
        const rowHeight = Math.max(1, ...cellLines.map((lines) => lines.length));
        for (let lineIndex = 0; lineIndex < rowHeight; lineIndex++) {
            const cells = row.map((cell, columnIndex) => {
                const { width, paddingRight } = columns[columnIndex];
                const line = cellLines[columnIndex][lineIndex] ?? "";
                const styledLine = cell.style && line.length > 0 ? cell.style(line) : line;
                const space = Math.max(width - stringWidth(line), 0);
                return `${" ".repeat(PADDING_LEFT)}${styledLine}${" ".repeat(space + paddingRight)}`;
            });
            output += `║${cells.join("│")}║\n`;
        }
    });
    if (options.drawHorizontalLine(rowCount, rowCount)) {
        output += drawBorder(columnWidths, { left: "╚", body: "═", join: "╧", right: "╝" });
    }
    return output;
};
