// LICENSE : MIT
"use strict";
var assert = require("power-assert");
var parse = require("../");
var Syntax = require("../lib/markdown/markdown-syntax");
var inspect = function (obj) {
    return JSON.stringify(obj, null, 4);
};
var traverse = require("traverse");
function findFirstTypedNode(node, type, value) {
    var result = null;
    traverse(node).forEach(function (x) {
        if (this.notLeaf) {
            if (x.type === type && x.raw === value) {
                result = x;
            }
        }
    });
    return result;
}
/*
    NOTE:
        `line` start with 1
        `column` start with 0

 */
describe("markdown-parser", function () {
    context('Node type is Document', function () {
        it("should has implemented TxtNode", function () {
            var RootDocument = parse("");
            assert.equal(RootDocument.type, Syntax.Document);
            assert.equal(RootDocument.raw, "");
            assert.deepEqual(RootDocument.loc, {
                start: {
                    line: 1,
                    column: 0
                },
                end: {
                    line: 1,
                    column: 0
                }
            });
            assert.deepEqual(RootDocument.range, [0, 0]);
        });
    });
    /*
        Paragraph > Str
     */
    context("Node type is Paragraph", function () {
        var AST, rawValue;
        beforeEach(function () {
            rawValue = "string";
            AST = parse(rawValue);
        });
        context("Paragraph", function () {
            it("should has implemented TxtNode", function () {
                var node = findFirstTypedNode(AST, Syntax.Paragraph, rawValue);
                assert.equal(node.raw, rawValue);
                assert.deepEqual(node.loc, {
                    start: {
                        line: 1,
                        column: 0
                    },
                    end: {
                        line: 1,
                        column: rawValue.length
                    }
                });
                assert.deepEqual(node.range, [0, rawValue.length]);
            });
        });
        context("Str", function () {
            it("should has implemented TxtNode", function () {
                var node = findFirstTypedNode(AST, Syntax.Str, rawValue);
                assert.equal(node.raw, rawValue);
                assert.deepEqual(node.loc, {
                    start: {
                        line: 1,
                        column: 0
                    },
                    end: {
                        line: 1,
                        column: rawValue.length
                    }
                });
                assert.deepEqual(node.range, [0, rawValue.length]);
            });
        });
    });
    /*
        H1  > Str
     */
    context("Node type is Header", function () {
        var AST, rawValue;
        beforeEach(function () {
            rawValue = "string";
            AST = parse("# " + rawValue);
        });
        context("Header", function () {
            it("should has implemented TxtNode", function () {
                var node = findFirstTypedNode(AST, "Header", rawValue);
                assert.equal(node.raw, rawValue);
                assert.deepEqual(node.loc, {
                    start: {
                        line: 1,
                        column: 0
                    },
                    end: {
                        line: 1,
                        column: rawValue.length
                    }
                });
                assert.deepEqual(node.range, [0, rawValue.length]);
            });
        });
        context("Str", function () {
            it("should has implemented TxtNode", function () {
                var node = findFirstTypedNode(AST, Syntax.Str, rawValue);
                assert.equal(node.raw, rawValue);
                assert.deepEqual(node.loc, {
                    start: {
                        line: 1,
                        column: 0
                    },
                    end: {
                        line: 1,
                        column: rawValue.length
                    }
                });
                assert.deepEqual(node.range, [0, rawValue.length]);
            });
        });
    })
});