// LICENSE : MIT
"use strict";

import { ASTNodeTypes, TxtNode, TxtParentNode } from "@textlint/ast-node-types";
import { Controller, traverse, VisitorOption } from "../src/";

const { parse } = require("@textlint/markdown-to-ast");
const Syntax = require("@textlint/markdown-to-ast").Syntax as typeof ASTNodeTypes;
import { dump } from "./traverse-dump";

const assert = require("assert");
const enter = "enter";
const leave = "leave";
describe("txt-traverse", () => {
    describe("#traverse", () => {
        it("should traverse", () => {
            const AST: TxtParentNode = parse("# Header\n" + "Hello*world*");
            const resultOfDump = dump(AST);
            const expected = [
                [enter, Syntax.Document, null],
                // # Header
                [enter, Syntax.Header, Syntax.Document],
                [enter, Syntax.Str, Syntax.Header],
                [leave, Syntax.Str, Syntax.Header],
                [leave, Syntax.Header, Syntax.Document],
                // => Paragraph
                [enter, Syntax.Paragraph, Syntax.Document],
                [enter, Syntax.Str, Syntax.Paragraph],
                [leave, Syntax.Str, Syntax.Paragraph],
                // *world*
                [enter, Syntax.Emphasis, Syntax.Paragraph],
                [enter, Syntax.Str, Syntax.Emphasis],
                [leave, Syntax.Str, Syntax.Emphasis],
                [leave, Syntax.Emphasis, Syntax.Paragraph],
                // <= Paragraph
                [leave, Syntax.Paragraph, Syntax.Document],
                // End
                [leave, Syntax.Document, null]
            ];
            assert.deepEqual(resultOfDump, expected);
        });
        it("should traverse empty string", () => {
            const AST: TxtParentNode = parse("");
            const resultOfDump = dump(AST);
            const expected = [
                // Enter
                [enter, Syntax.Document, null],
                // Leave
                [leave, Syntax.Document, null]
            ];
            assert.deepEqual(resultOfDump, expected);
        });
        it("should traverse List", () => {
            const AST: TxtParentNode = parse(`- item 1 **Bold**`);
            const resultOfDump = dump(AST);
            const expected = [
                ["enter", Syntax.Document, null],
                ["enter", Syntax.List, Syntax.Document],
                ["enter", Syntax.ListItem, Syntax.List],
                ["enter", Syntax.Paragraph, Syntax.ListItem],
                ["enter", Syntax.Str, Syntax.Paragraph],
                ["leave", Syntax.Str, Syntax.Paragraph],
                ["enter", Syntax.Strong, Syntax.Paragraph],
                ["enter", Syntax.Str, Syntax.Strong],
                ["leave", Syntax.Str, Syntax.Strong],
                ["leave", Syntax.Strong, Syntax.Paragraph],
                ["leave", Syntax.Paragraph, Syntax.ListItem],
                ["leave", Syntax.ListItem, Syntax.List],
                ["leave", Syntax.List, Syntax.Document],
                ["leave", Syntax.Document, null]
            ];
            assert.deepEqual(resultOfDump, expected, JSON.stringify(resultOfDump));
        });
        it("should traverse Link", () => {
            const AST: TxtParentNode = parse(`[link](http://example.com)`);
            const resultOfDump = dump(AST);
            const expected = [
                ["enter", "Document", null],
                ["enter", "Paragraph", "Document"],
                ["enter", "Link", "Paragraph"],
                ["enter", "Str", "Link"],
                ["leave", "Str", "Link"],
                ["leave", "Link", "Paragraph"],
                ["leave", "Paragraph", "Document"],
                ["leave", "Document", null]
            ];
            assert.deepEqual(resultOfDump, expected, JSON.stringify(resultOfDump));
        });
        it("should traverse BlockQuote", () => {
            const AST: TxtParentNode = parse(`> **bold**`);
            const resultOfDump = dump(AST);
            const expected = [
                ["enter", "Document", null],
                ["enter", "BlockQuote", "Document"],
                ["enter", "Paragraph", "BlockQuote"],
                ["enter", "Strong", "Paragraph"],
                ["enter", "Str", "Strong"],
                ["leave", "Str", "Strong"],
                ["leave", "Strong", "Paragraph"],
                ["leave", "Paragraph", "BlockQuote"],
                ["leave", "BlockQuote", "Document"],
                ["leave", "Document", null]
            ];
            assert.deepEqual(resultOfDump, expected, JSON.stringify(resultOfDump));
        });
        it("should traverse Code", () => {
            const AST: TxtParentNode = parse("This is `code`");
            const resultOfDump = dump(AST);
            const expected = [
                ["enter", Syntax.Document, null],
                ["enter", Syntax.Paragraph, Syntax.Document],
                ["enter", Syntax.Str, Syntax.Paragraph],
                ["leave", Syntax.Str, Syntax.Paragraph],
                ["enter", Syntax.Code, Syntax.Paragraph],
                ["leave", Syntax.Code, Syntax.Paragraph],
                ["leave", Syntax.Paragraph, Syntax.Document],
                ["leave", Syntax.Document, null]
            ];
            assert.deepEqual(resultOfDump, expected, JSON.stringify(resultOfDump));
        });
        it("should traverse CodeBlock", () => {
            const AST: TxtParentNode = parse("```" + "code block" + "```");
            const resultOfDump = dump(AST);
            const expected = [
                ["enter", Syntax.Document, null],
                ["enter", Syntax.Paragraph, Syntax.Document],
                ["enter", Syntax.Code, Syntax.Paragraph],
                ["leave", Syntax.Code, Syntax.Paragraph],
                ["leave", Syntax.Paragraph, Syntax.Document],
                ["leave", Syntax.Document, null]
            ];
            assert.deepEqual(resultOfDump, expected, JSON.stringify(resultOfDump));
        });
        context("SKIP", () => {
            it("skip child nodes", () => {
                const AST: TxtParentNode = parse("# Header\n" + "Hello*world*");
                const results: [string, string][] = [];
                traverse(AST, {
                    enter(node: TxtNode) {
                        results.push([enter, node.type]);
                        if (node.type === Syntax.Header) {
                            return VisitorOption.Skip;
                        }
                        return;
                    },
                    leave(node) {
                        results.push([leave, node.type]);
                    }
                });
                const expected = [
                    [enter, Syntax.Document],
                    // # Header
                    [enter, Syntax.Header],
                    // SKIP [enter, Syntax.Str],
                    // SKIP [leave, Syntax.Str],
                    [leave, Syntax.Header],
                    // => Paragraph
                    [enter, Syntax.Paragraph],
                    [enter, Syntax.Str],
                    [leave, Syntax.Str],
                    // *world*
                    [enter, Syntax.Emphasis],
                    [enter, Syntax.Str],
                    [leave, Syntax.Str],
                    [leave, Syntax.Emphasis],
                    // <= Paragraph
                    [leave, Syntax.Paragraph],
                    // End
                    [leave, Syntax.Document]
                ];
                assert.deepEqual(results, expected);
            });
        });
        context("BREAK", () => {
            it("break child nodes", () => {
                const AST: TxtParentNode = parse("# Header\n" + "Hello*world*");
                const results: [string, string][] = [];
                traverse(AST, {
                    enter(node: TxtNode) {
                        results.push([enter, node.type]);
                        if (node.type === Syntax.Header) {
                            return VisitorOption.Break;
                        }
                        return;
                    },
                    leave(node) {
                        results.push([leave, node.type]);
                    }
                });
                const expected = [
                    [enter, Syntax.Document],
                    // # Header
                    [enter, Syntax.Header]
                ];
                assert.deepEqual(results, expected);
            });
        });
    });
    describe("#parents", () => {
        it("should return parent nodes", () => {
            const AST = parse("Hello*world*");
            const controller = new Controller();
            let emParents: any[] = [];
            let documentParents: any[] = [];
            controller.traverse(AST, {
                enter(node: TxtNode) {
                    if (node.type === Syntax.Document) {
                        documentParents = controller.parents();
                    }
                    if (node.type === Syntax.Emphasis) {
                        emParents = controller.parents();
                    }
                }
            });
            const emParentTypes = emParents.map((node) => {
                return node.type;
            });
            const documentParentTypes = documentParents.map((node) => {
                return node.type;
            });
            assert.deepEqual(emParentTypes, [Syntax.Document, Syntax.Paragraph]);
            assert.deepEqual(documentParentTypes, []);
        });
    });
    describe("#current", () => {
        it("should return current node", () => {
            const AST = parse("Hello*world*");
            const controller = new Controller();
            controller.traverse(AST, {
                enter(node) {
                    assert.equal(controller.current()!.type, node.type);
                },
                leave(node) {
                    assert.equal(controller.current()!.type, node.type);
                }
            });
        });
    });
});
