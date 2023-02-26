import assert from "assert";
import { loadTextlintrc } from "../../src";

describe("loadTextlintrc", () => {
    it("should not throw TypeError when parameter is empty", async () => {
        assert.doesNotThrow(async () => {
            await loadTextlintrc();
        }, TypeError);
    });
});
