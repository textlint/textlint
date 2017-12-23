// LICENSE : MIT
"use strict";
import { getFormatterList } from "textlint-fixer-formatter";
import assert from "power-assert";

describe("textlint-fixer-formatter-test", function() {
    describe("getFormatterList", function() {
        it("should return list of formatter(s)", function() {
            assert.deepEqual(getFormatterList(), [
                { name: "compats" },
                { name: "diff" },
                { name: "json" },
                { name: "stylish" }
            ]);
        });
    });
});
