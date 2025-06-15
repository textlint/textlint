import assert from "node:assert";
import { describe, it } from "vitest";
import { loadTextlintrc } from "../../src/index.js";

describe("loadTextlintrc", () => {
    it("should not throw TypeError when parameters are empty", async () => {
        assert.doesNotThrow(async () => {
            await loadTextlintrc();
        }, TypeError);
    });
});
