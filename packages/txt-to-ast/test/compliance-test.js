// LICENSE : MIT
"use strict";
var test = require("textlint-ast-test").test;
var isTxtAST = require("textlint-ast-test").isTxtAST;
var parse = require("../src/plaintext-parser");
var assert = require("assert");
describe("Compliance tests", function () {
    it("should pass the test", function(){
        var AST = parse("this is text.\n" +
            "\m" +
            "test");
        test(AST);
        assert(isTxtAST(AST));
    });
});
