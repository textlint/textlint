// Mocha-style tests that should pass with node-test-globals
const assert = require("node:assert");
const calls = [];
describe("mocha style", function () {
    this.timeout(5000);
    before(function () {
        calls.push("before");
    });
    beforeEach(() => {
        calls.push("beforeEach");
    });
    afterEach("named hook", () => {
        calls.push("afterEach");
    });
    after(() => {
        assert.deepStrictEqual(calls.slice(0, 2), ["before", "beforeEach"]);
    });
    it("sync test", function () {
        this.timeout(5000);
        assert.ok(true);
    });
    it("async test", async () => {
        await new Promise((resolve) => setTimeout(resolve, 1));
    });
    it("callback test", function (done) {
        setTimeout(done, 1);
    });
    specify("specify alias", () => {});
    it.skip("skipped test", () => {
        throw new Error("should not run");
    });
    it("this.skip()", function () {
        this.skip();
        throw new Error("should not run");
    });
    context("context alias", () => {
        it("nested test", () => {});
    });
});
