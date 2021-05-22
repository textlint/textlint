// LICENSE : MIT
"use strict";
import assert from "assert";
import { getFixerFormatterList } from "../src";

describe("@textlint/fixer-formatter-test", function () {
    describe("getFormatterList", function () {
        it("should return list of formatter(s)", function () {
            assert.deepStrictEqual(getFixerFormatterList(), [
                { name: "compats" },
                { name: "diff" },
                { name: "json" },
                { name: "stylish" }
            ]);
        });
    });
});
