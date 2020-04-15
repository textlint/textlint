import { moduleInterop } from "../src";
import assert = require("assert");

describe("moduleExports", function () {
    it("should interop commonjs", () => {
        const value = moduleInterop(require("./fixtures/cjs"));
        assert.strictEqual(value, 42);
    });
    it("should interop es module", () => {
        const value = moduleInterop(require("./fixtures/esmodule"));
        assert.strictEqual(value, 42);
    });
    it("should interop ts module", () => {
        const value = moduleInterop(require("./fixtures/module"));
        assert.strictEqual(value, 42);
    });
});
