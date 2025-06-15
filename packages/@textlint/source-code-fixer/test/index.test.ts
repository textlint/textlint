// TOOD: move test from kernel
import { applyFixesToText } from "../src/index.js";
import { describe, it } from "vitest";
import * as assert from "node:assert";

describe("source-code-fixer", function () {
    it("should not change if no apply messages", () => {
        const output = applyFixesToText("text", []);
        assert.strictEqual(output, "text");
    });
});
