import assert from "node:assert";
import { describe, it } from "vitest";
import { moduleInterop } from "../src/index.js";

describe("moduleExports", function () {
    it("should interop commonjs", () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const value = moduleInterop(require("./fixtures/cjs"));
        assert.strictEqual(value, 42);
    });
    it("should interop es module", () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const value = moduleInterop(require("./fixtures/esmodule"));
        assert.strictEqual(value, 42);
    });
    it("should interop ts module", () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const value = moduleInterop(require("./fixtures/module"));
        assert.strictEqual(value, 42);
    });
});
