import assert from "node:assert";
import { describe, it } from "vitest";
import { alignColumns } from "../../src/helper/align-columns.js";

describe("alignColumns", () => {
    it("aligns the columns to the left by default", () => {
        assert.strictEqual(
            alignColumns([
                ["a", "bb", "c"],
                ["aaa", "b", "cc"]
            ]),
            ["a    bb  c", "aaa  b   cc"].join("\n")
        );
    });
    it("aligns the column to the right with 'r'", () => {
        assert.strictEqual(
            alignColumns(
                [
                    ["", 1, 2],
                    ["", 10, 20]
                ],
                ["", "r", "l"]
            ),
            ["   1  2", "  10  20"].join("\n")
        );
    });
    it("removes the trailing whitespaces of a row", () => {
        assert.strictEqual(
            alignColumns([
                ["a", ""],
                ["bbb", "c"]
            ]),
            ["a", "bbb  c"].join("\n")
        );
    });
    it("uses the terminal width of fullwidth characters and ignores escape sequences", () => {
        assert.strictEqual(
            alignColumns([
                ["日本", "x"],
                ["\u001B[31mab\u001B[39m", "y"],
                ["abcde", "z"]
            ]),
            ["日本   x", "\u001B[31mab\u001B[39m     y", "abcde  z"].join("\n")
        );
    });
    it("uses the longest line of a multiline cell", () => {
        assert.strictEqual(
            alignColumns([
                ["a\nbbb", "x"],
                ["cc", "y"]
            ]),
            ["a\nbbb  x", "cc   y"].join("\n")
        );
    });
    it("returns an empty string for no rows", () => {
        assert.strictEqual(alignColumns([]), "");
    });
});
