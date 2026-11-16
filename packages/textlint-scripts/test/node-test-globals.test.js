const assert = require("node:assert");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { describe, it } = require("node:test");

const globalsPath = path.join(__dirname, "../configs/node-test-globals.js");
const fixturesDir = path.join(__dirname, "fixtures/node-test-globals");
const runFixture = (name) => {
    // Run as a top-level test runner, not as a child of the current test file
    const env = { ...process.env };
    delete env.NODE_TEST_CONTEXT;
    const result = spawnSync(
        process.execPath,
        ["--require", globalsPath, "--test", "--test-reporter=tap", path.join(fixturesDir, name)],
        { encoding: "utf-8", env }
    );
    return { status: result.status, output: result.stdout + result.stderr };
};

describe("node-test-globals", () => {
    it("runs Mocha-style tests with node:test", () => {
        const { status, output } = runFixture("pass.js");
        assert.strictEqual(status, 0, output);
        assert.match(output, /# pass 5/);
        assert.match(output, /# skipped 2/);
    });
    it("fails when done is called with an error", () => {
        const { status, output } = runFixture("fail-done.js");
        assert.strictEqual(status, 1, output);
        assert.match(output, /done error/);
    });
    it("fails when a suite function throws", () => {
        const { status, output } = runFixture("fail-suite.js");
        assert.strictEqual(status, 1, output);
        assert.match(output, /suite error/);
    });
});
