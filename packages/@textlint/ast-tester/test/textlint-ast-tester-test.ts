import * as assert from "assert";
import { test, isTxtAST } from "../src/";
import fs from "fs";
import path from "path";

describe("@textlint/ast-tester", function () {
    context("when markdown-to-ast", function () {
        it("should not throw", function () {
            const AST = JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures/markdown-to-ast.json"), "utf-8"));
            test(AST);
            assert.ok(isTxtAST(AST));
        });
    });
    context("when @textlint/text-to-ast", function () {
        it("should not throw", function () {
            const AST = JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures/text-to-ast.json"), "utf-8"));
            test(AST);
            assert.ok(isTxtAST(AST));
        });
    });
    context("when invalid case", function () {
        it("should throw with details", () => {
            const AST = JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures/invalid-ast.json"), "utf-8"));
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
