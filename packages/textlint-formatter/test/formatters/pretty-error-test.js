// LICENSE : MIT
"use strict";
var assert = require("power-assert");
var path = require("path");
var prettyError = require("../../lib/formatters/pretty-error");
var stripAnsi = require("strip-ansi");
describe("pretty-error", function () {
    context("when first line", function () {

        it("should start 0 line", function () {
            const fooFile = path.join(__dirname, "../fixtures", "foo.md");
            var code = [
                {
                    filePath: fooFile,
                    messages: [
                        {
                            message: "Unexpected foo.",
                            severity: 2,
                            line: 1,
                            column: 1,
                            ruleId: "foo",
                            source: "foo"
                        }
                    ]
                }
            ];
            var output = prettyError(code, {
                color: false
            });
            assert.equal(output, `foo: Unexpected foo.
${fooFile}:1:1
       v
    0. 
    1. 1st line
    2. 2nd line
       ^

\u2716 1 problem (1 error, 0 warnings)
`);
        });
    });

    context("when contain fixable", function () {

        it("should return output", function () {
            const fooFile = path.join(__dirname, "../fixtures", "foo.md");
            const barFile = path.join(__dirname, "../fixtures", "bar.md");
            var code = [
                {
                    filePath: fooFile,
                    messages: [
                        {
                            message: "Unexpected foo.",
                            severity: 2,
                            line: 5,
                            column: 10,
                            ruleId: "foo",
                            fix: {
                                range: [40, 45],
                                text: "fixed 1"
                            }
                        }
                    ]
                }, {
                    filePath: barFile,
                    messages: [
                        {
                            message: "Unexpected bar.",
                            severity: 1,
                            line: 6,
                            column: 1,
                            ruleId: "bar",
                            fix: {
                                range: [50, 55],
                                text: "fixed 2"
                            }

                        }
                    ]
                }
            ];
            var output = prettyError(code, {
                color: false
            });
            assert.equal(output, `✓ foo: Unexpected foo.
${fooFile}:5:10
                v
    4. 4th line
    5. 5th line foo
    6. 6th line
                ^

✓ bar: Unexpected bar.
${barFile}:6:1
       v
    5. 5th line foo
    6. 6th line
    7. 
       ^

\u2716 2 problems (1 error, 1 warning)
\u2713 2 fixable problems.
Try to run: $ textlint --fix [file]
`);
        });
    });
    context("when last line", function () {

        it("should contain end+1 line", function () {
            const fooFile = path.join(__dirname, "../fixtures", "foo.md");
            var code = [
                {
                    filePath: fooFile,
                    messages: [
                        {
                            message: "Unexpected foo.",
                            severity: 2,
                            line: 6,
                            column: 1,
                            ruleId: "foo",
                            source: "foo"
                        }
                    ]
                }
            ];
            var output = prettyError(code, {
                color: false
            });
            assert.equal(output, `foo: Unexpected foo.
${fooFile}:6:1
       v
    5. 5th line foo
    6. 6th line
    7. 
       ^

\u2716 1 problem (1 error, 0 warnings)
`);
        });
    });
    context("when last line", function () {

        it("should contain end+1 line", function () {
            const fooFile = path.join(__dirname, "../fixtures", "foo.md");
            var code = [
                {
                    filePath: fooFile,
                    messages: [
                        {
                            message: "Unexpected foo.",
                            severity: 2,
                            line: 6,
                            column: 1,
                            ruleId: "foo",
                            source: "foo"
                        }
                    ]
                }
            ];
            var output = prettyError(code, {
                color: false
            });
            assert.equal(output, `foo: Unexpected foo.
${fooFile}:6:1
       v
    5. 5th line foo
    6. 6th line
    7. 
       ^

\u2716 1 problem (1 error, 0 warnings)
`);
        });
    });
    context("when CKJ(東アジア文字幅)", function () {
        it("should correct position ^", function () {
            const ckjFile = path.join(__dirname, "../fixtures", "ckj.md");
            var code = [
                {
                    filePath: ckjFile,
                    messages: [
                        {
                            message: "Unexpected foo.",
                            severity: 2,
                            line: 2,
                            column: 16,
                            ruleId: "foo",
                            fix: {
                                range: [40, 45],
                                text: "fixed 1"
                            }
                        }
                    ]
                }
            ];
            var output = prettyError(code, {
                color: false
            });
            assert.equal(output, `✓ foo: Unexpected foo.
${ckjFile}:2:16
                             v
    1. 1st line
    2. 日本語 中国語 English！
    3. 3rd line
                             ^

\u2716 1 problem (1 error, 0 warnings)
\u2713 1 fixable problem.
Try to run: $ textlint --fix [file]
`);
        });
    })
});