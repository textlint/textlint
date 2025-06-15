// LICENSE : MIT
"use strict";
import { parse } from "../src/index.js";
import { describe, test, it } from "vitest";
import { test, isTxtAST } from "@textlint/ast-tester";
import assert from "node:assert";
describe("Compliance tests", function () {
    it("should pass the test", function () {
        const AST = parse("this is text.\n" + "m" + "test");
        test(AST);
        assert(isTxtAST(AST));
    });
});
