import { separateByAvailability } from "../../src/util/separate-by-availability.js";
import { describe, it } from "vitest";
import assert from "node:assert";

describe("separateByAvailability", () => {
    it("should separate availableFiles/unAvailableFiles", () => {
        const _availableFiles = ["foo.md", "test.md", "path/to/foo.md"];
        const _unAvailableFiles = ["bar.not-supports"];
        const { availableFiles, unAvailableFiles } = separateByAvailability(
            [..._availableFiles, ..._unAvailableFiles],
            { extensions: [".md"] }
        );
        assert.deepStrictEqual(availableFiles, _availableFiles);
        assert.deepStrictEqual(unAvailableFiles, _unAvailableFiles);
    });
    it("should find dot files", () => {
        const files = [".foo"];
        const { availableFiles, unAvailableFiles } = separateByAvailability(files, { extensions: [".foo"] });
        assert.deepStrictEqual(availableFiles, [".foo"]);
        assert.deepStrictEqual(unAvailableFiles, []);
    });
});
