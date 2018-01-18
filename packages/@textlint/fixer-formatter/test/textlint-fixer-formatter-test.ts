// LICENSE : MIT
"use strict";
import { getFixerFormatterList } from "@textlint/fixer-formatter";
import assert from "power-assert";

describe("@textlint/fixer-formatter-test", function() {
    describe("getFormatterList", function() {
        it("should return list of formatter(s)", function() {
            assert.deepEqual(getFixerFormatterList(), [
                { name: "compats" },
                { name: "diff" },
                { name: "json" },
                { name: "stylish" }
            ]);
        });
    });
});
