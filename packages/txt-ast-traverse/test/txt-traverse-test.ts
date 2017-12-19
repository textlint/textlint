// LICENSE : MIT
"use strict";
import { Controller, traverse, VisitorOption } from "../lib/txt-ast-traverse.js";

const { parse, Syntax } = require("markdown-to-ast");
import dump from "./traverse-dump.js";
import { TxtNode, TxtParentNode } from "@textlint/ast-node-types";

const assert = require("assert");
const enter = "enter";
const leave = "leave";
describe("txt-traverse", () => {
    describe("#traverse", () => {
        let AST: TxtParentNode;
        beforeEach(() => {
            AST = parse("# Header\n" + "Hello*world*");
        });
        it("should traverse", () => {
            const resultOfDump = dump(AST);
            const expected = [
                [enter, Syntax.Document],
                // # Header
                [enter, Syntax.Header],
                [enter, Syntax.Str],
                [leave, Syntax.Str],
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
            assert.deepEqual(resultOfDump, expected);
        });
        context("SKIP", () => {
            it("skip child nodes", () => {
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
            const emParentTypes = emParents.map(node => {
                return node.type;
            });
            const documentParentTypes = documentParents.map(node => {
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
