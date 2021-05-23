import * as assert from "assert";
import { test, isTxtAST } from "../src/";

describe("@textlint/ast-tester", function () {
    context("when markdown-to-ast", function () {
        it("should not throw", function () {
            const AST = require("./fixtures/markdown-to-ast.json");
            test(AST);
            assert.ok(isTxtAST(AST));
        });
    });
    context("when @textlint/text-to-ast", function () {
        it("should not throw", function () {
            const AST = require("./fixtures/text-to-ast.json");
            test(AST);
            assert.ok(isTxtAST(AST));
        });
    });
    context("when invalid case", function () {
        it("should throw with details", () => {
            const AST = require("./fixtures/invalid-ast.json");
            assert.throws(() => {
                test(AST);
            }, /invalid range/);
        });
        it("should  throw", function () {
            assert.throws(function () {
                test({
                    type: "string"
                });
            });
            assert.ok(!isTxtAST({}));
        });
    });
});
