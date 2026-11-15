import * as assert from "node:assert";
import { describe, it } from "vitest";
import { test, isTxtAST } from "../src/index.js";
import fs from "node:fs";
import path from "node:path";

/**
 * AST of "text\ntext": Paragraph > Str, Break, Paragraph > Str
 */
const createAST = () => {
    const paragraph = (start: number, line: number) => ({
        type: "Paragraph",
        raw: "text",
        range: [start, start + 4],
        loc: { start: { line, column: 0 }, end: { line, column: 4 } },
        children: [
            {
                type: "Str",
                raw: "text",
                value: "text",
                range: [start, start + 4],
                loc: { start: { line, column: 0 }, end: { line, column: 4 } }
            }
        ]
    });
    return {
        type: "Document",
        raw: "text\ntext",
        range: [0, 9],
        loc: { start: { line: 1, column: 0 }, end: { line: 2, column: 4 } },
        children: [
            paragraph(0, 1),
            {
                type: "Break",
                raw: "\n",
                range: [4, 5],
                loc: { start: { line: 1, column: 4 }, end: { line: 2, column: 0 } }
            },
            paragraph(5, 2)
        ]
    };
};

describe("@textlint/ast-tester", function () {
    describe("when markdown-to-ast", function () {
        it("should not throw", function () {
            const AST = JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures/markdown-to-ast.json"), "utf-8"));
            test(AST);
            assert.ok(isTxtAST(AST));
        });
    });
    describe("when @textlint/text-to-ast", function () {
        it("should not throw", function () {
            const AST = JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures/text-to-ast.json"), "utf-8"));
            test(AST);
            assert.ok(isTxtAST(AST));
        });
    });
    describe("when the AST follows the conventions", function () {
        it("should not throw", function () {
            test(createAST());
            assert.ok(isTxtAST(createAST()));
        });
        it("should accept a lone CR as a line ending or as a character", function () {
            const asLineEnding = {
                type: "Document",
                raw: "a\rb",
                range: [0, 3],
                loc: { start: { line: 1, column: 0 }, end: { line: 2, column: 1 } },
                children: []
            };
            const asCharacter = {
                ...asLineEnding,
                loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } }
            };
            test(asLineEnding);
            test(asCharacter);
        });
        it("should test a deep AST", function () {
            let node: Record<string, unknown> = {
                type: "Str",
                raw: "a",
                value: "a",
                range: [0, 1],
                loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } }
            };
            // The depth stays within what JSON.stringify handles on every platform
            for (let i = 0; i < 200; i++) {
                node = { type: "Emphasis", raw: "a", range: [0, 1], loc: node.loc, children: [node] };
            }
            test(node);
        });
    });
    describe("when invalid case", function () {
        it("should throw with details", () => {
            const AST = JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures/invalid-ast.json"), "utf-8"));
            assert.throws(() => {
                test(AST);
            }, /invalid range/);
        });
        it("should throw when raw is not the text of range", () => {
            const AST = createAST();
            AST.children[0].children[0].raw = "Text";
            assert.throws(() => test(AST), /invalid raw: raw should be the text of range/);
            assert.ok(!isTxtAST(AST));
        });
        it("should throw when loc is not the position of range", () => {
            const AST = createAST();
            // the position after a line break is the start of the next line
            AST.children[1].loc.end = { line: 1, column: 5 };
            assert.throws(() => test(AST), /invalid loc: loc.end should be the position of range\[1\]/);
            const AST2 = createAST();
            AST2.children[2].loc.start = { line: 2, column: 1 };
            assert.throws(() => test(AST2), /invalid loc: loc.start should be the position of range\[0\]/);
        });
        it("should throw when a child is outside of its parent", () => {
            const AST = createAST();
            AST.children[0].range = [0, 3];
            AST.children[0].raw = "tex";
            AST.children[0].loc.end = { line: 1, column: 3 };
            assert.throws(() => test(AST), /invalid range: range should be inside of the range of the parent/);
        });
        it("should throw when siblings overlap", () => {
            const AST = createAST();
            AST.children[1].range = [3, 5];
            AST.children[1].raw = "t\n";
            AST.children[1].loc.start = { line: 1, column: 3 };
            assert.throws(() => test(AST), /invalid range: range should not overlap with the previous sibling/);
        });
        it("should accept a lone CR as a line ending or as a character, but not both in one tree", () => {
            const createCRAST = (rootEnd: object, child: { start: object; end: object }) => ({
                type: "Document",
                raw: "a\rb",
                range: [0, 3],
                loc: { start: { line: 1, column: 0 }, end: rootEnd },
                children: [{ type: "Str", raw: "b", value: "b", range: [2, 3], loc: child }]
            });
            const asLineEnding = { start: { line: 2, column: 0 }, end: { line: 2, column: 1 } };
            const asCharacter = { start: { line: 1, column: 2 }, end: { line: 1, column: 3 } };
            test(createCRAST({ line: 2, column: 1 }, asLineEnding));
            test(createCRAST({ line: 1, column: 3 }, asCharacter));
            assert.throws(
                () => test(createCRAST({ line: 2, column: 1 }, asCharacter)),
                /invalid loc: loc.start should be the position of range\[0\]/
            );
        });
        it("should  throw", function () {
            assert.throws(function () {
                test({
                    type: "string"
                });
            });
            assert.ok(!isTxtAST({}));
        });
    });
});
