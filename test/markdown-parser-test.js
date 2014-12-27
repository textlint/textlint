// LICENSE : MIT
"use strict";
var assert = require("power-assert");
var parse = require("../lib/parse/markdown/markdown-parser");
var Syntax = require("../lib/parse/markdown/markdown-syntax");
var traverse = require("traverse");
function findFirstTypedNode(node, type) {
    var result = null;
    traverse(node).forEach(function (x) {
        if (this.notLeaf) {
            if (x.type === type) {
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
        var markdown = "# title\n\n- list\ntest";
        var ast = parse(markdown);
        var paragraph = findFirstTypedNode(ast, Syntax.Paragraph);
        it("should has range array", function () {
            var expectedText = "test";
            var expectedStartIndex = markdown.indexOf(expectedText);
            var expectedEndIndex = markdown.length;
            assert.deepEqual(paragraph.range, [expectedStartIndex, expectedEndIndex]);
            assert.equal(markdown.slice(expectedStartIndex, expectedEndIndex), expectedText);
        });
    });
});