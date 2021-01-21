// TOOD: move test from kernel
import { applyFixesToText } from "../src";
import * as assert from "assert";

describe("source-code-fixer", function () {
    it("should not change if no apply messages", () => {
        const output = applyFixesToText("text", []);
        assert.strictEqual(output, "text");
    });
});
