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
    context("ast.children", function () {
        it("should be alternately Str and Break", function () {
            var text = "First Line\n" +
                "Second Line";
            var ast = parse(text);
            // first
            assert(ast.children[0].type === Syntax.Str);
            assert(ast.children[0].raw === "First Line");
            assert(ast.children[1].type === Syntax.Break);
            // second
            assert(ast.children[2].type === Syntax.Str);
            assert(ast.children[2].raw === "Second Line");
            assert(ast.children[3].type === Syntax.Break);
        });
    });
});