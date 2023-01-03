"use strict";
import path from "path";
import rawOutput from "../../src/formatters/raw-output";
import assert from "assert";

const formatter = (code) => {
    return rawOutput(code, { color: false });
};

describe("formatter:raw-output", function () {
    context("when single modified", function () {
        it("should return output", function () {
            const input = path.join(__dirname, "../fixtures", "single.md");
            const code = require("../fixtures/single");
            const output = formatter(code, { color: false });
            assert.strictEqual(
                output,
                `
1st line
2nd line
3rd line
4th line
5th line
6th line
7th line
`.trimStart()
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
1st line
2nd line
3rd line
4th line
5th line
6th line
7th line
`.trimStart()
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
1st line
2nd line
3rd line
4th line
5th line
6th line
7th line
1st line
2nd line
3rd line
4th line
5th line
6th line
7th line
`.trimStart()
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
1st line
2nd line
3rd line
4th line
5th line
6th line XXX
7th line
`.trimStart()
            );
        });
    });
});
