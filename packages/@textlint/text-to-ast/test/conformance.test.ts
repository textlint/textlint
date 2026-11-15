// LICENSE : MIT
"use strict";
import { parse } from "../src/index.js";
import { describe, it } from "vitest";
import { test as testAST } from "@textlint/ast-tester";
import assert from "node:assert";

type Summary = [type: string, raw: string];
const summarize = (text: string): Summary[] => {
    return parse(text).children.map((node) => [node.type, node.raw]);
};

describe("Conformance to the Plain text parsing Requirements", function () {
    it("makes each line that is not empty a Paragraph with one Str", function () {
        const ast = parse("first line\n  second line  ");
        const paragraphs = ast.children.filter((node) => node.type === "Paragraph");
        assert.deepStrictEqual(
            paragraphs.map((paragraph) => paragraph.children?.map((str) => [str.type, str.value])),
            [[["Str", "first line"]], [["Str", "  second line  "]]]
        );
    });
    it("makes each line ending a Break, including the line endings of empty lines", function () {
        assert.deepStrictEqual(summarize("a\n\nb"), [
            ["Paragraph", "a"],
            ["Break", "\n"],
            ["Break", "\n"],
            ["Paragraph", "b"]
        ]);
    });
    it("makes the line endings at the end of the text Break nodes", function () {
        assert.deepStrictEqual(summarize("a\n\n"), [
            ["Paragraph", "a"],
            ["Break", "\n"],
            ["Break", "\n"]
        ]);
        assert.deepStrictEqual(summarize("\n\n"), [
            ["Break", "\n"],
            ["Break", "\n"]
        ]);
    });
    it("treats \\r\\n as one line ending", function () {
        assert.deepStrictEqual(summarize("a\r\n\r\nb"), [
            ["Paragraph", "a"],
            ["Break", "\r\n"],
            ["Break", "\r\n"],
            ["Paragraph", "b"]
        ]);
    });
    it("ends a line with a lone \\r", function () {
        assert.deepStrictEqual(summarize("a\rb"), [
            ["Paragraph", "a"],
            ["Break", "\r"],
            ["Paragraph", "b"]
        ]);
    });
    it("keeps U+2028 and U+2029 as characters of the line", function () {
        assert.deepStrictEqual(summarize("a\u2028b\u2029c"), [["Paragraph", "a\u2028b\u2029c"]]);
    });
    it("treats \\r\\r as two line endings and \\n\\r as two line endings", function () {
        assert.deepStrictEqual(summarize("a\r\rb"), [
            ["Paragraph", "a"],
            ["Break", "\r"],
            ["Break", "\r"],
            ["Paragraph", "b"]
        ]);
        assert.deepStrictEqual(summarize("a\n\rb"), [
            ["Paragraph", "a"],
            ["Break", "\n"],
            ["Break", "\r"],
            ["Paragraph", "b"]
        ]);
    });
    it("returns a Document without children for an empty text", function () {
        const ast = parse("");
        assert.deepStrictEqual(ast.children, []);
        assert.deepStrictEqual(ast.range, [0, 0]);
        assert.deepStrictEqual(ast.loc, { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } });
    });
    it("puts the end of a Document that ends with a line ending at column 0 of the next line", function () {
        assert.deepStrictEqual(parse("a\n").loc.end, { line: 2, column: 0 });
        assert.deepStrictEqual(parse("a\n\n").loc.end, { line: 3, column: 0 });
    });
    it("does not count a BOM in positions", function () {
        const withBOM = parse("﻿a\nb");
        const withoutBOM = parse("a\nb");
        assert.deepStrictEqual(withBOM, withoutBOM);
        assert.strictEqual(withBOM.raw, "a\nb");
    });
    it("follows the position conventions of TxtAST for any combination of lines", function () {
        const parts = ["a", "あ", " ", "\t", "\n", "\r\n", "\r", "\u2028", "\u2029", "😀", ""];
        // Every text of up to 4 parts
        const texts = [""];
        for (let length = 0; length < 4; length++) {
            for (const text of texts.slice()) {
                for (const part of parts) {
                    texts.push(text + part);
                }
            }
        }
        for (const text of texts) {
            testAST(parse(text) as unknown as Record<string, unknown>);
        }
    });
});
