// LICENSE : MIT
"use strict";
const test = require("@textlint/ast-tester").test;
const isTxtAST = require("@textlint/ast-tester").isTxtAST;
const parse = require("../src/plaintext-parser");
const assert = require("assert");
describe("Compliance tests", function() {
    it("should pass the test", function() {
        const AST = parse("this is text.\n" + "m" + "test");
        test(AST);
        assert(isTxtAST(AST));
    });
});
