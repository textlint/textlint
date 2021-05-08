// LICENSE : MIT
"use strict";
import { parse, Syntax } from "../src";
import assert from "assert";
describe("plaintext-parser-test", function () {
    context("Document", function () {
        it("should return AST", function () {
            const text = "text";
            const ast = parse(text);
            assert(typeof ast === "object");
            // top type is always Document
            assert.equal(ast.type, Syntax.Document);
            assert.equal(ast.raw, text);
            assert.deepStrictEqual(ast.loc, { start: { line: 1, column: 0 }, end: { line: 1, column: text.length } });
            assert.deepStrictEqual(ast.range, [0, text.length]);
            // should has children
            assert(ast.children.length > 0);
        });
    });
    context("Paragraph", function () {
        it("should contain Str node", function () {
            const text = "Hello world";
            const ast = parse(text);
            const expected = {
                type: "Document",
                range: [0, 11],
                raw: text,
                loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 11 } },
                children: [
                    {
                        type: "Paragraph",
                        raw: "Hello world",
                        range: [0, 11],
                        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 11 } },
                        children: [
                            {
                                type: "Str",
                                raw: "Hello world",
                                value: "Hello world",
                                range: [0, 11],
                                loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 11 } }
                            }
                        ]
                    }
                ]
            }; // column start with 0
            assert.deepStrictEqual(ast, expected);
        });
    });
    context("Paragraph ended with break line", function () {
        it("should contain Break node", function () {
            const text = "text\n";
            const ast = parse(text);
            // Paragraph -> Break
            const expected = {
                type: "Document",
                range: [0, 5],
                raw: text,
                loc: { start: { line: 1, column: 0 }, end: { line: 2, column: 0 } },
                children: [
                    {
                        type: "Paragraph",
                        raw: "text",
                        range: [0, 4],
                        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 4 } },
                        children: [
                            {
                                type: "Str",
                                raw: "text",
                                value: "text",
                                range: [0, 4],
                                loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 4 } }
                            }
                        ]
                    },
                    {
                        type: "Break",
                        raw: "\n",
                        range: [4, 5],
                        loc: { start: { line: 1, column: 4 }, end: { line: 1, column: 5 } }
                    }
                ]
            };
            assert.deepStrictEqual(ast, expected);
        });
    });
    context("Paragraph + BR + Paragraph", function () {
        it("should equal to P + BR + P", function () {
            const text = "text\ntext";
            const ast = parse(text);
            // Paragraph -> Break -> Paragraph
            const expected = {
                type: "Document",
                range: [0, text.length],
                raw: text,
                loc: { start: { line: 1, column: 0 }, end: { line: 2, column: 4 } },
                children: [
                    {
                        type: "Paragraph",
                        raw: "text",
                        range: [0, 4],
                        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 4 } },
                        children: [
                            {
                                type: "Str",
                                raw: "text",
                                value: "text",
                                range: [0, 4],
                                loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 4 } }
                            }
                        ]
                    },
                    {
                        type: "Break",
                        raw: "\n",
                        range: [4, 5],
                        loc: { start: { line: 1, column: 4 }, end: { line: 1, column: 5 } }
                    },
                    {
                        type: "Paragraph",
                        raw: "text",
                        range: [5, 9],
                        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 4 } },
                        children: [
                            {
                                type: "Str",
                                raw: "text",
                                value: "text",
                                range: [5, 9],
                                loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 4 } }
                            }
                        ]
                    }
                ]
            };
            assert.deepStrictEqual(ast, expected);
        });
    });
    context("Paragraph + BR + BR + Paragraph", function () {
        it("should equal to P + BR + BR + P", function () {
            const text = "text\n" + "\n" + "text";
            const ast = parse(text);

            // Paragraph -> Break -> Paragraph
            const expected = {
                type: "Document",
                range: [0, text.length],
                raw: text,
                loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 4 } },
                children: [
                    {
                        type: "Paragraph",
                        raw: "text",
                        range: [0, 4],
                        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 4 } },
                        children: [
                            {
                                type: "Str",
                                raw: "text",
                                value: "text",
                                range: [0, 4],
                                loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 4 } }
                            }
                        ]
                    },
                    {
                        type: "Break",
                        raw: "\n",
                        range: [4, 5],
                        loc: { start: { line: 1, column: 4 }, end: { line: 1, column: 5 } }
                    },
                    {
                        type: "Break",
                        raw: "\n",
                        range: [5, 6],
                        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 1 } }
                    },
                    {
                        type: "Paragraph",
                        raw: "text",
                        range: [6, 10],
                        loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 4 } },
                        children: [
                            {
                                type: "Str",
                                raw: "text",
                                value: "text",
                                range: [6, 10],
                                loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 4 } }
                            }
                        ]
                    }
                ]
            };
            assert.deepStrictEqual(ast, expected);
        });
    });
});
