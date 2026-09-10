// LICENSE : MIT
"use strict";
import assert from "node:assert";
import { describe, it } from "vitest";
import { getFixerFormatterList, resolveFormatter } from "../src/index.js";

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

    describe("resolveFormatter", function () {
        it("should resolve built-in fixer formatters", function () {
            assert.strictEqual(resolveFormatter("stylish"), "stylish");
            assert.strictEqual(resolveFormatter("fixed-result"), "fixed-result");
        });

        it("should return null for linter-only formatters", function () {
            assert.strictEqual(resolveFormatter("pretty-error"), null);
        });
    });
});
