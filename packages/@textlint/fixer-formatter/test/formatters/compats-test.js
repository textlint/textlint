"use strict";
import path from "node:path";
import { describe, it } from "vitest";
import compats from "../../src/formatters/compats.js";
import assert from "node:assert";

const formatter = (code) => {
    return compats(code, { color: false });
};

describe("formatter:compats", function () {
    describe("when single modified", function () {
        it("should return output", function () {
            const input = path.join(__dirname, "../fixtures", "single.md");
            const code = require("../fixtures/single");
            const output = formatter(code, { color: false });
            assert.strictEqual(
                output,
                `
Fixed✔ ${input}: line 5, col 9, Error - Unexpected foo. (foo)


Fixed 1 problem
`.trim()
            );
        });
    });
    describe("when double modified", function () {
        it("should return output", function () {
            const input = path.join(__dirname, "../fixtures", "double.md");
            const code = require("../fixtures/double");
            const output = formatter(code, { color: false });
            assert.strictEqual(
                output,
                `
Fixed✔ ${input}: line 5, col 1, Error - Unexpected foo. (foo)
Fixed✔ ${input}: line 6, col 1, Error - Unexpected bar. (foo)


Fixed 2 problems
`.trim()
            );
        });
    });
    describe("when multiple files results", function () {
        it("should return output", function () {
            const singleFile = path.join(__dirname, "../fixtures", "single.md");
            const multiple = path.join(__dirname, "../fixtures", "multiple.md");
            const code = require("../fixtures/multiple");
            const output = formatter(code, { color: false });
            assert.strictEqual(
                output,
                `
Fixed✔ ${singleFile}: line 5, col 9, Error - Unexpected foo. (foo)
Fixed✔ ${multiple}: line 1, col 1, Error - Unexpected foo. (foo)
Fixed✔ ${multiple}: line 1, col 4, Error - Unexpected bar. (foo)
Fixed✔ ${multiple}: line 3, col 1, Error - Unexpected foo. (foo)
Fixed✔ ${multiple}: line 3, col 4, Error - Unexpected bar. (foo)
Fixed✔ ${multiple}: line 7, col 1, Error - Unexpected foo. (foo)
Fixed✔ ${multiple}: line 7, col 4, Error - Unexpected bar. (foo)


Fixed 7 problems
`.trim()
            );
        });
    });

    describe("when remaining messages", function () {
        it("should return output", function () {
            const input = path.join(__dirname, "../fixtures", "remaining.md");
            const code = require("../fixtures/remaining");
            const output = formatter(code, { color: false });
            assert.strictEqual(
                output,
                `
Fixed✔ ${input}: line 5, col 9, Error - Unexpected foo. (foo)


Fixed 1 problem
`.trim()
            );
        });
    });
});
