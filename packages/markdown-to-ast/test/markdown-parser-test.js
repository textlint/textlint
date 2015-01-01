// LICENSE : MIT
"use strict";
var assert = require("power-assert");
var parse = require("../");
var Syntax = require("./union-syntax");
var inspect = function (obj) {
    return JSON.stringify(obj, null, 4);
};
var traverse = require("traverse");
function findFirstTypedNode(node, type, value) {
    var result = null;
    traverse(node).forEach(function (x) {
        if (this.notLeaf) {
            if (x.type === type) {
                if (value == null) {
                    result = x;
                } else if (x.raw === value) {
                    result = x;
                }
            }
        }
    });
    if (result == null) {
        console.log("Not Found type:" + type );
        console.log(inspect(node));
    }
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
        context("Text", function () {
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
                var node = findFirstTypedNode(AST, Syntax.Header, rawValue);
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
    context("Node type is Link", function () {
        var AST, rawValue, labelText;
        beforeEach(function () {
            labelText = "text";
            rawValue = "[" + labelText + "](http://example.com)";
            AST = parse(rawValue);
        });
        it("should has implemented TxtNode", function () {
            var node = findFirstTypedNode(AST, Syntax.Link);
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

    context("Node type is List", function () {
        var AST, rawValue, text;
        beforeEach(function () {
            text = "text";
            rawValue = "- " + text;
            AST = parse(rawValue);
        });
        it("should has implemented TxtNode", function () {
            var node = findFirstTypedNode(AST, Syntax.ListItem);
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