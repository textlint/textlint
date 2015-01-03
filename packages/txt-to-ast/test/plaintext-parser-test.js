// LICENSE : MIT
"use strict";
var parse = require("../").parse;
var Syntax = require("../").Syntax;
var assert = require("power-assert");
describe("plaintext-parser-test", function () {
    it("should return AST", function () {
        var text = "TEST text";
        var ast = parse(text);
        assert(typeof ast === "object");
        // top type is always Document
        assert.equal(ast.type, Syntax.Document);
        assert(ast.loc, Syntax.Document);
        // should has children
        assert(ast.children.length > 0);
    });
    it("ast.children is Paragraphes", function () {
        var text = "First Line\n" +
            "Second Line";
        var ast = parse(text);
        // first
        assert(ast.children[0].type === Syntax.Paragraph);
        // second
        assert(ast.children[1].type === Syntax.Paragraph);
    });

    context("Paragraph", function () {
        it("should be alternately Str and Break", function () {
            var text = "Hello world";
            var ast = parse(text);
            var expected = {
                "type": "Document",
                "range": [
                    0,
                    11
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 0 // column start with 0
                    },
                    "end": {
                        "line": 1,
                        "column": 11
                    }
                },
                "children": [
                    {
                        "type": "Paragraph",
                        "raw": "Hello world",
                        "range": [
                            0,
                            11
                        ],
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 0
                            },
                            "end": {
                                "line": 1,
                                "column": 11
                            }
                        },
                        "children": [
                            {
                                "type": "Str",
                                "raw": "Hello world",
                                "range": [
                                    0,
                                    11
                                ],
                                "loc": {
                                    "start": {
                                        "line": 1,
                                        "column": 0
                                    },
                                    "end": {
                                        "line": 1,
                                        "column": 11
                                    }
                                }
                            }
                        ]
                    }
                ]
            };
            assert.deepEqual(ast, expected)
        });
    });
});