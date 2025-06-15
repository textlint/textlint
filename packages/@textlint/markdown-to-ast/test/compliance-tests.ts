import assert from "node:assert";
import { describe, it } from "vitest";
import { test as astTest } from "@textlint/ast-tester";
import { parse } from "../lib/src/index.js";
import { TxtNode } from "@textlint/ast-node-types";
import type { Node } from "unist";
// String -> [String]
describe("Compliance tests", function () {
    describe("compatible for Unist", function () {
        it("should have position", function () {
            const AST: TxtNode & Node = parse("text");
            astTest(AST);
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
