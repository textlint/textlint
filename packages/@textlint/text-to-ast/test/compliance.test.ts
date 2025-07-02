// LICENSE : MIT
"use strict";
import { parse } from "../src/index.js";
import { describe, it } from "vitest";
import { test as testAST, isTxtAST } from "@textlint/ast-tester";
import assert from "node:assert";
describe("Compliance tests", function () {
    it("should pass the test", function () {
        const AST = parse("this is text.\n" + "m" + "test");
        testAST(AST as unknown as Record<string, unknown>);
        assert(isTxtAST(AST));
    });
});
