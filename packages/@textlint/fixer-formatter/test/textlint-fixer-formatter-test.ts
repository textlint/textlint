// LICENSE : MIT
"use strict";
import assert from "assert";
import { getFixerFormatterList, loadFormatter } from "../src";

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
    describe("loadFormatter", async function () {
        assert.doesNotThrow(async () => {
            await loadFormatter();
        }, TypeError);
    });
});
