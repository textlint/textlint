// LICENSE : MIT
"use strict";
import assert from "node:assert";
import { describe, it } from "vitest";
import { getFixerFormatterList } from "../src/index.js";

describe("@textlint/fixer-formatter-test", function () {
    describe("getFormatterList", function () {
        it("should return list of formatter(s)", function () {
            assert.deepStrictEqual(getFixerFormatterList(), [
                { name: "compats" },
                { name: "diff" },
                { name: "fixed-result" },
                { name: "json" },
                { name: "stylish" }
            ]);
        });
    });
});
