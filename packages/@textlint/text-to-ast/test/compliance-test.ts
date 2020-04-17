// LICENSE : MIT
"use strict";
import { parse } from "../src";
import { test } from "@textlint/ast-tester";
import { isTxtAST } from "@textlint/ast-tester";
import assert from "assert";
describe("Compliance tests", function () {
    it("should pass the test", function () {
        const AST = parse("this is text.\n" + "m" + "test");
        test(AST);
        assert(isTxtAST(AST));
    });
});
