// LICENSE : MIT
"use strict";
import path from "path";
import assert from "assert";
import diff from "../../src/formatters/diff";

const formatter = (code) => {
    return diff(code, { color: false });
};
describe("formatter:diff", function () {
    context("when single modified", function () {
        it("should return output", function () {
            const input = path.join(__dirname, "../fixtures", "single.md");
            const code = require("../fixtures/single");
            const output = formatter(code, { color: false });
            assert.equal(
                output,
                `
${input}
...
- 5th line foo
+ 5th line
6th line
...

✔ Fixed 1 problem
`
            );
        });
    });
    context("when double modified", function () {
        it("should return output", function () {
            const input = path.join(__dirname, "../fixtures", "double.md");
            const code = require("../fixtures/double");
            const output = formatter(code, { color: false });
            assert.equal(
                output,
                `
${input}
...
- foo
- bar
+ 5th line
+ 6th line
7th line


✔ Fixed 2 problems
`
            );
        });
    });
    context("when multiple files results", function () {
        it("should return output", function () {
            const singleFile = path.join(__dirname, "../fixtures", "single.md");
            const multiple = path.join(__dirname, "../fixtures", "multiple.md");
            const code = require("../fixtures/multiple");
            const output = formatter(code, { color: false });
            assert.equal(
                output,
                `
${singleFile}
...
- 5th line foo
+ 5th line
6th line
...

${multiple}
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
`
            );
        });
    });

    context("when remaining messages", function () {
        it("should return output", function () {
            const input = path.join(__dirname, "../fixtures", "remaining.md");
            const code = require("../fixtures/remaining");
            const output = formatter(code, { color: false });
            assert.equal(
                output,
                `
${input}
...
- 5th line foo
+ 5th line
6th line XXX
...

✔ Fixed 1 problem
✖ Remaining 1 problem
`
            );
        });
    });
});
