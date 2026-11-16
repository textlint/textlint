const assert = require("node:assert");
const registerOnce = require("../configs/register-once");

const kRegistered = Symbol.for("textlint-scripts/register");

describe("register-once", () => {
    let original;
    beforeEach(() => {
        original = globalThis[kRegistered];
        delete globalThis[kRegistered];
    });
    afterEach(() => {
        globalThis[kRegistered] = original;
    });

    it("should install only the first register", () => {
        const calls = [];
        registerOnce("babel", () => calls.push("babel"));
        registerOnce("ts-node", () => calls.push("ts-node"));
        registerOnce("babel", () => calls.push("babel"));
        assert.deepStrictEqual(calls, ["babel"]);
        assert.strictEqual(globalThis[kRegistered], "babel");
    });

    it("should retry after a failed register", () => {
        assert.throws(() => {
            registerOnce("ts-node", () => {
                throw new Error("ts-node is required");
            });
        }, /ts-node is required/);
        const calls = [];
        registerOnce("babel", () => calls.push("babel"));
        assert.deepStrictEqual(calls, ["babel"]);
    });
});
