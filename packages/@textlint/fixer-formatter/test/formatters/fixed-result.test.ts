"use strict";
import { describe, it, expect } from "vitest";
import fixedResult from "../../src/formatters/fixed-result.js";
// @ts-expect-error - fixture files don't have type definitions
import singleFixture from "../fixtures/single.js";
// @ts-expect-error - fixture files don't have type definitions
import doubleFixture from "../fixtures/double.js";
// @ts-expect-error - fixture files don't have type definitions
import multipleFixture from "../fixtures/multiple.js";
// @ts-expect-error - fixture files don't have type definitions
import remainingFixture from "../fixtures/remaining.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatter = (code: any) => {
    return fixedResult(code);
};

describe("formatter:fixed-result", function () {
    describe("when single modified", function () {
        it("should return output", function () {
            const output = formatter(singleFixture);
            expect(output).toMatchInlineSnapshot(`
              "1st line
              2nd line
              3rd line
              4th line
              5th line
              6th line
              7th line
              "
            `);
        });
    });
    describe("when double modified", function () {
        it("should return output", function () {
            const output = formatter(doubleFixture);
            expect(output).toMatchInlineSnapshot(`
              "1st line
              2nd line
              3rd line
              4th line
              5th line
              6th line
              7th line
              "
            `);
        });
    });
    describe("when multiple files results", function () {
        it("should return output", function () {
            const output = formatter(multipleFixture);
            expect(output).toMatchInlineSnapshot(`
              "1st line
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
              "
            `);
        });
    });

    describe("when remaining messages", function () {
        it("should return output", function () {
            const output = formatter(remainingFixture);
            expect(output).toMatchInlineSnapshot(`
              "1st line
              2nd line
              3rd line
              4th line
              5th line
              6th line XXX
              7th line
              "
            `);
        });
    });
});
