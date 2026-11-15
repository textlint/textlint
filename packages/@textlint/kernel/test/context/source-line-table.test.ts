import { describe, it } from "vitest";
import * as assert from "node:assert";
import { SourceLineTable } from "../../src/context/source-line-table.js";

describe("SourceLineTable", function () {
    it("should convert an index to a position, and a position to an index", function () {
        const table = new SourceLineTable("ab\ncd\n\nef");
        const expected: [number, { line: number; column: number }][] = [
            [0, { line: 1, column: 0 }],
            [2, { line: 1, column: 2 }],
            [3, { line: 2, column: 0 }],
            [5, { line: 2, column: 2 }],
            [6, { line: 3, column: 0 }],
            [7, { line: 4, column: 0 }],
            [9, { line: 4, column: 2 }]
        ];
        for (const [index, position] of expected) {
            assert.deepStrictEqual(table.indexToPosition(index), position);
            assert.strictEqual(table.positionToIndex(position), index);
        }
    });
    it("should end a line with LF, CR, and CRLF", function () {
        for (const lineEnding of ["\n", "\r", "\r\n"]) {
            const table = new SourceLineTable(`a${lineEnding}b${lineEnding}`);
            const indexOfB = 1 + lineEnding.length;
            // the line ending itself is on the line that it ends
            assert.deepStrictEqual(table.indexToPosition(1), { line: 1, column: 1 });
            assert.deepStrictEqual(table.indexToPosition(indexOfB), { line: 2, column: 0 });
            // the position after the last line ending is the start of the next line
            assert.deepStrictEqual(table.indexToPosition(indexOfB + 1 + lineEnding.length), { line: 3, column: 0 });
        }
    });
    it("should count CRLF as one line ending, and CR CR as two", function () {
        assert.deepStrictEqual(new SourceLineTable("a\r\nb").indexToPosition(3), { line: 2, column: 0 });
        assert.deepStrictEqual(new SourceLineTable("a\r\rb").indexToPosition(3), { line: 3, column: 0 });
        assert.deepStrictEqual(new SourceLineTable("a\n\rb").indexToPosition(3), { line: 3, column: 0 });
    });
    it("should not end a line with U+2028 and U+2029", function () {
        for (const character of ["\u2028", "\u2029", "\u000B", "\u000C", "\u0085"]) {
            const table = new SourceLineTable(`a${character}b`);
            assert.deepStrictEqual(table.indexToPosition(2), { line: 1, column: 2 });
        }
    });
    it("should convert a range to a location, and a location to a range", function () {
        const table = new SourceLineTable("ab\r\ncd");
        const location = { start: { line: 1, column: 1 }, end: { line: 2, column: 1 } };
        assert.deepStrictEqual(table.rangeToLocation([1, 5]), location);
        assert.deepStrictEqual(table.locationToRange(location), [1, 5]);
    });
    it("should handle an empty text", function () {
        const table = new SourceLineTable("");
        assert.deepStrictEqual(table.indexToPosition(0), { line: 1, column: 0 });
        assert.strictEqual(table.positionToIndex({ line: 1, column: 0 }), 0);
    });
    it("should return the same position as loc of the Markdown parser", async function () {
        const { parse } = await import("@textlint/markdown-to-ast");
        const text = "# a\r\n\r\nb *c*\rd\u2028e\n\n- f\n";
        const table = new SourceLineTable(text);
        const stack = [parse(text) as { range: readonly [number, number]; loc: unknown; children?: unknown[] }];
        let count = 0;
        while (stack.length > 0) {
            const node = stack.pop()!;
            assert.deepStrictEqual(table.rangeToLocation(node.range), node.loc);
            count++;
            stack.push(...((node.children ?? []) as typeof stack));
        }
        assert.ok(count > 5);
    });
});
