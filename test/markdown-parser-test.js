// LICENSE : MIT
"use strict";
var assert = require("power-assert");
var parse = require("../lib/parse/markdown/markdown-parser");
var Syntax = require("../lib/parse/markdown/markdown-syntax");
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
describe("markdown-parser-test", function () {
    it("should return TxtNode", function () {
        var ast = parse("# title\n" +
        "paragraph");
        assert(typeof ast === "object");
        assert(ast.type === Syntax.Document);
    });
    context(".loc", function () {

    });
    context(".range", function () {
        var markdown;
        var ast;
        beforeEach(function () {
            markdown = "# AAA\ntest";
            ast = parse(markdown);
        });
        it("should has range array", function () {
            var expectedText = "test";
            var paragraph = findFirstTypedNode(ast, Syntax.Paragraph, expectedText);
            var expectedStartIndex = markdown.indexOf(expectedText);
            var expectedEndIndex = markdown.length;
            assert.equal(markdown.slice(expectedStartIndex, expectedEndIndex), expectedText);
            assert.deepEqual(paragraph.range, [expectedStartIndex, expectedEndIndex]);
        });
    });
});