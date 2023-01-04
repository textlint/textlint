"use strict";
import path from "path";
import compats from "../../src/formatters/compats";
import assert from "assert";

const formatter = (code) => {
    return compats(code, { color: false });
};

describe("formatter:compats", function () {
    context("when single modified", function () {
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
    context("when double modified", function () {
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
    context("when multiple files results", function () {
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

    context("when remaining messages", function () {
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
