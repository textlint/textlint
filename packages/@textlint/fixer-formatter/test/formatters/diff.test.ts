// LICENSE : MIT
"use strict";
import { describe, it, expect } from "vitest";
import diff from "../../src/formatters/diff.js";
import * as fs from "node:fs";
import type { TextlintFixResult } from "@textlint/types";
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
    return output.replace(/[^\s]*[/\\]([^/\\]+\.md)/g, "$1");
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatter = (code: any) => {
    const output = diff(code, { color: false, getSource: (filePath: string) => fs.readFileSync(filePath, "utf-8") });
    return normalizePaths(output);
};

describe("formatter:diff", function () {
    describe("when single modified", function () {
        it("should return output", function () {
            const output = formatter(singleFixture);
            expect(output).toMatchInlineSnapshot(`
              "
              single.md
              ...
              - 5th line foo
              + 5th line
              6th line
              ...

              ✔ Fixed 1 problem
              "
            `);
        });
    });
    describe("when double modified", function () {
        it("should return output", function () {
            const output = formatter(doubleFixture);
            expect(output).toMatchInlineSnapshot(`
              "
              double.md
              ...
              - foo
              - bar
              + 5th line
              + 6th line
              7th line


              ✔ Fixed 2 problems
              "
            `);
        });
    });
    describe("when multiple files results", function () {
        it("should return output", function () {
            const output = formatter(multipleFixture);
            expect(output).toMatchInlineSnapshot(`
              "
              single.md
              ...
              - 5th line foo
              + 5th line
              6th line
              ...

              multiple.md
              - foo bar
              + 1st line
              2nd line
              ...
              - foo bar
              + 4th line
              5th line
              ...
              - foo bar
              + 7th line


              ✔ Fixed 7 problems
              "
            `);
        });
    });

    describe("when remaining messages", function () {
        it("should return output", function () {
            const output = formatter(remainingFixture);
            expect(output).toMatchInlineSnapshot(`
              "
              remaining.md
              ...
              - 5th line foo
              + 5th line
              6th line XXX
              ...

              ✔ Fixed 1 problem
              ✖ Remaining 1 problem
              "
            `);
        });
    });
    describe("getSource", function () {
        const createResult = (filePath: string): TextlintFixResult => {
            const message = {
                type: "lint" as const,
                ruleId: "rule",
                message: "Message",
                line: 1,
                column: 1,
                index: 0,
                range: [0, 1] as const,
                loc: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
                severity: 2
            };
            return {
                filePath,
                output: "fixed\n",
                messages: [message],
                applyingMessages: [message],
                remainingMessages: []
            };
        };
        it("should compare the content from getSource with the output", function () {
            const output = diff([createResult("virtual.md")], {
                color: false,
                getSource: (filePath: string) => (filePath === "virtual.md" ? "original\n" : undefined)
            });
            expect(output).toContain("virtual.md\n");
            expect(output).toContain("- original");
            expect(output).toContain("+ fixed");
        });
        it("should skip the result when getSource returns undefined", function () {
            const output = diff([createResult("virtual.md")], {
                color: false,
                getSource: () => undefined
            });
            expect(output).not.toContain("virtual.md");
            expect(output).toContain("Fixed 1 problem");
        });
    });
});
