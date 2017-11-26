"use strict";
const assert = require("assert");
const stylish = require("../../../src/fixer/formatters/stylish");
const formatter = code => {
    return stylish(code, { color: false });
};
describe("formatter:stylish", function() {
    describe("when passed no messages", function() {
        var code = [{ filePath: "foo.js", applyingMessages: [], remainingMessages: [] }];
        it("should not return message", function() {
            var result = formatter(code);
            assert.equal(result, "");
        });
    });

    describe("when passed a single message", function() {
        var code = [
            {
                filePath: "foo.js",
                applyingMessages: [{ message: "Unexpected foo.", severity: 2, line: 5, column: 10, ruleId: "foo" }],
                remainingMessages: []
            }
        ];

        it("should return a string in the correct format for errors", function() {
            var result = formatter(code);
            assert.equal(
                result,
                `
foo.js
  5:10  ✔   Unexpected foo  foo

✔ Fixed 1 problem
`
            );
        });
    });

    describe("when passed multiple messages", function() {
        var code = [
            {
                filePath: "foo.js",
                applyingMessages: [
                    { message: "Unexpected foo.", severity: 2, line: 5, column: 10, ruleId: "foo" },
                    { message: "Unexpected bar.", severity: 1, line: 6, column: 11, ruleId: "bar" }
                ],
                remainingMessages: []
            }
        ];

        it("should return a string with multiple entries", function() {
            var result = formatter(code);
            assert.equal(
                result,
                `
foo.js
  5:10  ✔   Unexpected foo  foo
  6:11  ✔   Unexpected bar  bar

✔ Fixed 2 problems
`
            );
        });
    });

    describe("when passed multiple files with 1 message each", function() {
        var code = [
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

        it("should return a string with multiple entries", function() {
            var result = formatter(code);
            assert.equal(
                result,
                `
foo.js
  5:10  ✔   Unexpected foo  foo

bar.js
  6:11  ✔   Unexpected bar  bar

✔ Fixed 2 problems
`
            );
        });
    });

    describe("when passed remainingMessages", function() {
        var code = [
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

        it("should show remaining count", function() {
            var result = formatter(code);
            assert.equal(
                result,
                `
foo.js
  5:10  ✔   Unexpected foo  foo
  6:11  ✔   Unexpected bar  bar

✔ Fixed 2 problems
✖ Remaining 2 problems
`
            );
        });
    });
    describe("when passed one remainingMessages", function() {
        var code = [
            {
                filePath: "foo.js",
                applyingMessages: [
                    { message: "Unexpected foo.", severity: 2, line: 5, column: 10, ruleId: "foo" },
                    { message: "Unexpected bar.", severity: 1, line: 6, column: 11, ruleId: "bar" }
                ],
                remainingMessages: [{ fatal: true, message: "Couldn't find foo.js." }]
            }
        ];

        it("should show remaining count", function() {
            var result = formatter(code);
            assert.equal(
                result,
                `
foo.js
  5:10  ✔   Unexpected foo  foo
  6:11  ✔   Unexpected bar  bar

✔ Fixed 2 problems
✖ Remaining 1 problem
`
            );
        });
    });
});
