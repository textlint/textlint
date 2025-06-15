"use strict";
import path from "node:path";
import { describe, it } from "vitest";
import fixedResult from "../../src/formatters/fixed-result.js";
import assert from "node:assert";

const formatter = (code) => {
    return fixedResult(code, { color: false });
};

describe("formatter:fixed-result", function () {
    describe("when single modified", function () {
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
    describe("when double modified", function () {
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
    describe("when multiple files results", function () {
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

    describe("when remaining messages", function () {
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
