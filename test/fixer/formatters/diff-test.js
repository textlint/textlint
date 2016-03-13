// LICENSE : MIT
"use strict";
var assert = require("power-assert");
var path = require("path");
var fs = require("fs");
var diff = require("../../../src/fixer/formatters/diff");
const formatter = (code) => {
    return diff(code, {color: false});
};
describe("formatter:diff", function () {
      context("when contain fixable", function () {
        it("should return output", function () {
            const fooFile = path.join(__dirname, "../fixtures", "foo.md");
            const fixedFooFile = path.join(__dirname, "../fixtures", "foo-fixed.md");
            const expectedOutput = fs.readFileSync(fixedFooFile, "utf-8");
            const code = [
                {
                    filePath: fooFile,
                    output: expectedOutput,
                    applyingMessages: [
                        {
                            message: "Unexpected foo.",
                            severity: 2,
                            line: 5,
                            column: 9,
                            ruleId: "foo",
                            fix: {
                                range: [44, 48],
                                text: ""
                            }
                        }
                    ],
                    remainingMessages: []
                }
            ];
            var output = formatter(code);
            assert.equal(output, `
${fooFile}
...
- 5th line foo
+ 5th line
6th line
...

✔ Fixed 1 problem
`);
        });
    });
    context("when contain multiple fixable", function () {
        it("should return output", function () {
            const fooFile = path.join(__dirname, "../fixtures", "bar.md");
            const fixedFooFile = path.join(__dirname, "../fixtures", "bar-fixed.md");
            const expectedOutput = fs.readFileSync(fixedFooFile, "utf-8");
            const code = [
                {
                    filePath: fooFile,
                    output: expectedOutput,
                    applyingMessages: [
                        {
                            message: "Unexpected foo.",
                            severity: 2,
                            line: 5,
                            column: 1,
                            ruleId: "foo",
                            fix: {
                                range: [36, 40],
                                text: "5th line"
                            }
                        },
                        {
                            message: "Unexpected bar.",
                            severity: 2,
                            line: 6,
                            column: 1,
                            ruleId: "foo",
                            fix: {
                                range: [40, 44],
                                text: "6th line"
                            }
                        }
                    ],
                    remainingMessages: []
                }
            ];
            var output = formatter(code);
            assert.equal(output, `
${fooFile}
...
- foo
- bar
+ 5th line
+ 6th line
7th line


✔ Fixed 2 problems
`);
        });
    });
});
