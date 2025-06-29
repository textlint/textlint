"use strict";
import { describe, it, expect } from "vitest";
import compats from "../../src/formatters/compats.js";
// @ts-expect-error - fixture files don't have type definitions
import singleFixture from "../fixtures/single.js";
// @ts-expect-error - fixture files don't have type definitions
import doubleFixture from "../fixtures/double.js";
// @ts-expect-error - fixture files don't have type definitions
import multipleFixture from "../fixtures/multiple.js";
// @ts-expect-error - fixture files don't have type definitions
import remainingFixture from "../fixtures/remaining.js";

// Helper function to normalize paths to just filenames for cross-platform compatibility
const normalizePaths = (output: string) => {
    // Replace any path ending with a filename and replace with just the filename
    return output.replace(/[^\s]*[\/\\]([^\/\\]+\.md)/g, "$1");
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatter = (code: any) => {
    const output = compats(code);
    return normalizePaths(output);
};

describe("formatter:compats", function () {
    describe("when single modified", function () {
        it("should return output", function () {
            const output = formatter(singleFixture);
            expect(output).toMatchInlineSnapshot(`
              "Fixed✔ single.md: line 5, col 9, Error - Unexpected foo. (foo)


              Fixed 1 problem"
            `);
        });
    });
    describe("when double modified", function () {
        it("should return output", function () {
            const output = formatter(doubleFixture);
            expect(output).toMatchInlineSnapshot(`
              "Fixed✔ double.md: line 5, col 1, Error - Unexpected foo. (foo)
              Fixed✔ double.md: line 6, col 1, Error - Unexpected bar. (foo)


              Fixed 2 problems"
            `);
        });
    });
    describe("when multiple files results", function () {
        it("should return output", function () {
            const output = formatter(multipleFixture);
            expect(output).toMatchInlineSnapshot(`
              "Fixed✔ single.md: line 5, col 9, Error - Unexpected foo. (foo)
              Fixed✔ multiple.md: line 1, col 1, Error - Unexpected foo. (foo)
              Fixed✔ multiple.md: line 1, col 4, Error - Unexpected bar. (foo)
              Fixed✔ multiple.md: line 3, col 1, Error - Unexpected foo. (foo)
              Fixed✔ multiple.md: line 3, col 4, Error - Unexpected bar. (foo)
              Fixed✔ multiple.md: line 7, col 1, Error - Unexpected foo. (foo)
              Fixed✔ multiple.md: line 7, col 4, Error - Unexpected bar. (foo)


              Fixed 7 problems"
            `);
        });
    });

    describe("when remaining messages", function () {
        it("should return output", function () {
            const output = formatter(remainingFixture);
            expect(output).toMatchInlineSnapshot(`
              "Fixed✔ remaining.md: line 5, col 9, Error - Unexpected foo. (foo)


              Fixed 1 problem"
            `);
        });
    });
});
