import * as assert from "node:assert";
import { describe, test, it } from "vitest";
import { test, isTxtAST } from "../src/index.js";
import fs from "node:fs";
import path from "node:path";

describe("@textlint/ast-tester", function () {
    describe("when markdown-to-ast", function () {
        it("should not throw", function () {
            const AST = JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures/markdown-to-ast.json"), "utf-8"));
            test(AST);
            assert.ok(isTxtAST(AST));
        });
    });
    describe("when @textlint/text-to-ast", function () {
        it("should not throw", function () {
            const AST = JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures/text-to-ast.json"), "utf-8"));
            test(AST);
            assert.ok(isTxtAST(AST));
        });
    });
    describe("when invalid case", function () {
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
