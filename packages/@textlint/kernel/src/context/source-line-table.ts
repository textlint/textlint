import type { TextlintSourceCodeLocation, TextlintSourceCodePosition, TextlintSourceCodeRange } from "@textlint/types";

/**
 * Start offsets of the lines of the text.
 * A line ends with LF, CR, or CRLF, and CRLF is one line ending.
 * It is the definition of the lines of `loc` in TxtAST, so a position from this table agrees with `loc` of a node.
 */
const createLineStarts = (text: string): number[] => {
    const lineStarts = [0];
    if (text.indexOf("\r") === -1) {
        for (let index = text.indexOf("\n"); index !== -1; index = text.indexOf("\n", index + 1)) {
            lineStarts.push(index + 1);
        }
        return lineStarts;
    }
    const length = text.length;
    for (let index = 0; index < length; index++) {
        const code = text.charCodeAt(index);
        if (code === 10) {
            lineStarts.push(index + 1);
        } else if (code === 13) {
            if (text.charCodeAt(index + 1) === 10) {
                index++;
            }
            lineStarts.push(index + 1);
        }
    }
    return lineStarts;
};

/**
 * Convert between an index of the text and a position that has a line and a column.
 * A line starts with 1, and a column starts with 0.
 * The table of lines is created when a conversion is requested for the first time,
 * and it is cached for the following conversions. The text does not change, so the cache is never invalidated.
 * The result of each conversion is not cached, because a conversion is one binary search.
 */
export class SourceLineTable {
    private readonly text: string;
    /** Cache of the table of lines. `undefined` until the first conversion */
    private lineStarts: number[] | undefined;

    constructor(text: string) {
        this.text = text;
    }

    /**
     * Return the table of lines. It is created at the first call and reused after that.
     */
    private getLineStarts(): number[] {
        if (this.lineStarts === undefined) {
            this.lineStarts = createLineStarts(this.text);
        }
        return this.lineStarts;
    }

    locationToRange(loc: TextlintSourceCodeLocation): TextlintSourceCodeRange {
        return [this.positionToIndex(loc.start), this.positionToIndex(loc.end)];
    }

    rangeToLocation(range: TextlintSourceCodeRange): TextlintSourceCodeLocation {
        return {
            start: this.indexToPosition(range[0]),
            end: this.indexToPosition(range[1])
        };
    }

    positionToIndex(position: TextlintSourceCodePosition): number {
        return this.getLineStarts()[position.line - 1] + position.column;
    }

    indexToPosition(index: number): TextlintSourceCodePosition {
        const lineStarts = this.getLineStarts();
        // the last line that starts at or before the index
        let low = 0;
        let high = lineStarts.length - 1;
        while (low < high) {
            const middle = (low + high + 1) >> 1;
            if (lineStarts[middle] <= index) {
                low = middle;
            } else {
                high = middle - 1;
            }
        }
        return {
            line: low + 1,
            column: index - lineStarts[low]
        };
    }
}
