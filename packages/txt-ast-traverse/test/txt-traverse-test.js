// LICENSE : MIT
"use strict";
import { traverse, VisitorOption } from '../lib/txt-ast-traverse.js';
import { parse, Syntax } from "markdown-to-ast"
import dump from "./traverse-dump.js";
var assert = require("power-assert");
var enter = "enter",
    leave = "leave";
describe("txt-traverse", ()=> {
    describe("#traverse", ()=> {
        var AST;
        beforeEach(()=> {
            AST = parse("# Header\n" +
            "Hello*world*");
        });
        it("should traverse", ()=> {
            var resultOfDump = dump(AST);
            var expected = [
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
        context("SKIP", ()=> {
            it("skip child nodes", ()=> {
                var results = [];
                traverse(AST, {
                    enter(node) {
                        results.push([enter, node.type]);
                        if (node.type === Syntax.Header) {
                            return VisitorOption.Skip;
                        }
                    },
                    leave(node) {
                        results.push([leave, node.type]);
                    }
                });
                var expected = [
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
        context("BREAK", ()=> {
            it("break child nodes", ()=> {
                var results = [];
                traverse(AST, {
                    enter(node) {
                        results.push([enter, node.type]);
                        if (node.type === Syntax.Header) {
                            return VisitorOption.Break;
                        }
                    },
                    leave(node) {
                        results.push([leave, node.type]);
                    }
                });
                var expected = [
                    [enter, Syntax.Document],
                    // # Header
                    [enter, Syntax.Header]
                ];
                assert.deepEqual(results, expected);
            });
        });


    });
});