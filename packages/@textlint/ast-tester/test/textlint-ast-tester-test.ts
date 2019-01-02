import * as assert from "assert";
import { test, isTxtAST } from "../src/textlint-ast-tester";

describe("@textlint/ast-tester", function() {
    context("when markdown-to-ast", function() {
        it("should not throw", function() {
            const AST = require("./fixtures/markdown-to-ast.json");
            test(AST);
            assert(isTxtAST(AST));
        });
    });
    context("when @textlint/text-to-ast", function() {
        it("should not throw", function() {
            const AST = require("./fixtures/text-to-ast.json");
            test(AST);
            assert(isTxtAST(AST));
        });
    });

    context("when invalid case", function() {
        it("should not throw", function() {
            assert.throws(function() {
                test({
                    type: "string"
                });
            });
            assert(!isTxtAST({}));
        });
    });
});
