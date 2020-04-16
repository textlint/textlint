import assert from "assert";
import { test } from "@textlint/ast-tester";
import { parse } from "../src/markdown-parser";
// String -> [String]
describe("Compliance tests", function () {
    context("compatible for Unist", function () {
        it("should have position", function () {
            const AST = parse("text");
            test(AST);
            assert(typeof AST.position === "object");
            assert(typeof AST.position.start === "object");
            assert(typeof AST.position.start.line === "number");
            assert(typeof AST.position.start.column === "number");
            assert(typeof AST.position.end === "object");
            assert(typeof AST.position.end.line === "number");
            assert(typeof AST.position.end.column === "number");
        });
    });
});
