"use strict";
import stylish from "../../src/formatters/stylish.js";
import { describe, it, expect } from "vitest";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatter = (code: any) => {
    return stylish(code, { color: false });
};

describe("formatter:stylish", function () {
    describe("when passed no messages", function () {
        const code = [{ filePath: "foo.js", applyingMessages: [], remainingMessages: [] }];
        it("should not return message", function () {
            const result = formatter(code);
            expect(result).toMatchInlineSnapshot(`""`);
        });
    });

    describe("when passed a single message", function () {
        const code = [
            {
                filePath: "foo.js",
                applyingMessages: [{ message: "Unexpected foo.", severity: 2, line: 5, column: 10, ruleId: "foo" }],
                remainingMessages: []
            }
        ];

        it("should return a string in the correct format for errors", function () {
            const result = formatter(code);
            expect(result).toMatchInlineSnapshot(`
              "
              foo.js
                5:10  ✔   Unexpected foo  foo

              ✔ Fixed 1 problem
              "
            `);
        });
    });

    describe("when passed a single info message", function () {
        const code = [
            {
                filePath: "foo.js",
                applyingMessages: [{ message: "Unexpected foo.", severity: 3, line: 5, column: 10, ruleId: "foo" }],
                remainingMessages: []
            }
        ];

        it("should return a string in the correct format for info", function () {
            const result = formatter(code);
            expect(result).toMatchInlineSnapshot(`
              "
              foo.js
                5:10  ✔   Unexpected foo  foo

              ✔ Fixed 1 problem
              "
            `);
        });
    });

    describe("when passed multiple messages", function () {
        const code = [
            {
                filePath: "foo.js",
                applyingMessages: [
                    { message: "Unexpected foo.", severity: 2, line: 5, column: 10, ruleId: "foo" },
                    { message: "Unexpected bar.", severity: 1, line: 6, column: 11, ruleId: "bar" }
                ],
                remainingMessages: []
            }
        ];

        it("should return a string with multiple entries", function () {
            const result = formatter(code);
            expect(result).toMatchInlineSnapshot(`
              "
              foo.js
                5:10  ✔   Unexpected foo  foo
                6:11  ✔   Unexpected bar  bar

              ✔ Fixed 2 problems
              "
            `);
        });
    });

    describe("when passed multiple files with 1 message each", function () {
        const code = [
            {
                filePath: "foo.js",
                applyingMessages: [{ message: "Unexpected foo.", severity: 2, line: 5, column: 10, ruleId: "foo" }],
                remainingMessages: []
            },
            {
                filePath: "bar.js",
                applyingMessages: [{ message: "Unexpected bar.", severity: 1, line: 6, column: 11, ruleId: "bar" }],
                remainingMessages: []
            }
        ];

        it("should return a string with multiple entries", function () {
            const result = formatter(code);
            expect(result).toMatchInlineSnapshot(`
              "
              foo.js
                5:10  ✔   Unexpected foo  foo

              bar.js
                6:11  ✔   Unexpected bar  bar

              ✔ Fixed 2 problems
              "
            `);
        });
    });

    describe("when passed remainingMessages", function () {
        const code = [
            {
                filePath: "foo.js",
                applyingMessages: [
                    { message: "Unexpected foo.", severity: 2, line: 5, column: 10, ruleId: "foo" },
                    { message: "Unexpected bar.", severity: 1, line: 6, column: 11, ruleId: "bar" }
                ],
                remainingMessages: [
                    { fatal: true, message: "Couldn't find foo.js." },
                    { fatal: true, message: "Couldn't find foo.js." }
                ]
            }
        ];

        it("should show remaining count", function () {
            const result = formatter(code);
            expect(result).toMatchInlineSnapshot(`
              "
              foo.js
                5:10  ✔   Unexpected foo  foo
                6:11  ✔   Unexpected bar  bar

              ✔ Fixed 2 problems
              ✖ Remaining 2 errors, 0 warnings, 0 infos
              "
            `);
        });
    });
    describe("when passed one remainingMessages", function () {
        const code = [
            {
                filePath: "foo.js",
                applyingMessages: [
                    { message: "Unexpected foo.", severity: 2, line: 5, column: 10, ruleId: "foo" },
                    { message: "Unexpected bar.", severity: 1, line: 6, column: 11, ruleId: "bar" }
                ],
                remainingMessages: [{ fatal: true, message: "Couldn't find foo.js." }]
            }
        ];

        it("should show remaining count", function () {
            const result = formatter(code);
            expect(result).toMatchInlineSnapshot(`
              "
              foo.js
                5:10  ✔   Unexpected foo  foo
                6:11  ✔   Unexpected bar  bar

              ✔ Fixed 2 problems
              ✖ Remaining 1 error, 0 warnings, 0 infos
              "
            `);
        });
    });
});
