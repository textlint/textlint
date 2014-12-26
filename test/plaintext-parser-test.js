// LICENSE : MIT
"use strict";
var parse = require("../lib/parse/plaintext/plaintext-parser");
var Syntax = require("../lib/parse/union-syntax");
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
            var text = "First Line\n" +
                "Second Line";
            var ast = parse(text);
            // first
            var paragraphCh1 = ast.children[0].children;
            assert(paragraphCh1[0].type === Syntax.Str);
            assert(paragraphCh1[0].raw === "First Line");
            assert(paragraphCh1[1].type === Syntax.Break);
            var paragraphCh2 = ast.children[1].children;
            assert(paragraphCh2[0].type === Syntax.Str);
            assert(paragraphCh2[0].raw === "Second Line");
            assert(paragraphCh2[1].type === Syntax.Break);
        });
    });
});