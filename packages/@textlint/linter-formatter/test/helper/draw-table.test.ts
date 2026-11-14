import { describe, it } from "vitest";
import assert from "node:assert";
import { drawTable, wrapWord } from "../../src/helper/draw-table.js";

describe("draw-table", () => {
    describe("wrapWord", () => {
        it("does not wrap a line that fits the width", () => {
            assert.deepStrictEqual(wrapWord("abc def", 10), ["abc def"]);
            assert.deepStrictEqual(wrapWord("", 10), [""]);
        });
        it("wraps a line at whitespaces", () => {
            assert.deepStrictEqual(wrapWord("aaa bbb ccc ddd", 8), ["aaa bbb", "ccc ddd"]);
            assert.deepStrictEqual(wrapWord("aaa   bbb", 5), ["aaa", "bbb"]);
        });
        it("wraps a line after a break character", () => {
            assert.deepStrictEqual(wrapWord("path/to/file.txt", 8), ["path/to/", "file.txt"]);
            assert.deepStrictEqual(wrapWord("aaaa-bbbb_cccc", 6), ["aaaa-", "bbbb_", "cccc"]);
        });
        it("wraps a word that is longer than the width at the width", () => {
            assert.deepStrictEqual(wrapWord("abcdefghij", 4), ["abcd", "efgh", "ij"]);
        });
        it("wraps by the terminal columns", () => {
            assert.deepStrictEqual(wrapWord("日本語のテキスト", 6), ["日本語", "のテキ", "スト"]);
            assert.deepStrictEqual(wrapWord("😀😀😀", 4), ["😀😀", "😀"]);
        });
    });
    describe("drawTable", () => {
        it("draws a table with borders", () => {
            const output = drawTable(
                [
                    [{ text: "Line" }, { text: "Message" }],
                    [{ text: "1" }, { text: "found a secret" }]
                ],
                {
                    columns: [{ width: 4 }, { width: 8, paddingRight: 3 }],
                    drawHorizontalLine: () => true
                }
            );
            assert.strictEqual(
                output,
                [
                    "╔══════╤════════════╗",
                    "║ Line │ Message    ║",
                    "╟──────┼────────────╢",
                    "║ 1    │ found a    ║",
                    "║      │ secret     ║",
                    "╚══════╧════════════╝",
                    ""
                ].join("\n")
            );
        });
        it("draws only the horizontal lines that drawHorizontalLine returns true", () => {
            const calls: [number, number][] = [];
            const output = drawTable([[{ text: "a" }], [{ text: "b" }], [{ text: "c" }]], {
                columns: [{ width: 1 }],
                drawHorizontalLine: (index, rowCount) => {
                    calls.push([index, rowCount]);
                    return index === 1;
                }
            });
            assert.strictEqual(output, ["║ a ║", "╟───╢", "║ b ║", "║ c ║", ""].join("\n"));
            assert.deepStrictEqual(calls, [
                [0, 3],
                [1, 3],
                [2, 3],
                [3, 3]
            ]);
        });
        it("splits a cell at line breaks", () => {
            const output = drawTable([[{ text: "a\r\nb\nc" }, { text: "x" }]], {
                columns: [{ width: 2 }, { width: 2 }],
                drawHorizontalLine: () => false
            });
            assert.strictEqual(output, ["║ a  │ x  ║", "║ b  │    ║", "║ c  │    ║", ""].join("\n"));
        });
        it("applies the style to each line, and the style does not change the layout", () => {
            const output = drawTable([[{ text: "aa bb", style: (line) => `<${line}>` }]], {
                columns: [{ width: 3 }],
                drawHorizontalLine: () => false
            });
            assert.strictEqual(output, ["║ <aa>  ║", "║ <bb>  ║", ""].join("\n"));
        });
        it("pads a cell by the terminal columns", () => {
            const output = drawTable([[{ text: "日本" }], [{ text: "ab" }]], {
                columns: [{ width: 6 }],
                drawHorizontalLine: () => false
            });
            assert.strictEqual(output, ["║ 日本   ║", "║ ab     ║", ""].join("\n"));
        });
    });
});
