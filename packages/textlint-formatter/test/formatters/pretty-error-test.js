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
            var output = stripAnsi(prettyError(code));
            assert.equal(output, `foo: Unexpected foo.
${fooFile}:1:1
       v
    0. 
    1. 1st line
    2. 2nd line
       ^

`);
        });
    });

    context("when middle", function () {

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
                            source: "foo"
                        }
                    ]
                }, {
                    filePath: barFile,
                    messages: [
                        {
                            message: "Unexpected bar.",
                            severity: 1,
                            line: 6,
                            column: 11,
                            ruleId: "bar",
                            source: "bar"
                        }
                    ]
                }
            ];
            var output = stripAnsi(prettyError(code));
            assert.equal(output, `foo: Unexpected foo.
${fooFile}:5:10
                v
    4. 4th line
    5. 5th line foo
    6. 6th line
                ^

bar: Unexpected bar.
${barFile}:6:11
              v
    5. 5th line foo
    6. 6th line
    7. 
              ^

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
            var output = stripAnsi(prettyError(code));
            assert.equal(output, `foo: Unexpected foo.
${fooFile}:6:1
       v
    5. 5th line foo
    6. 6th line
    7. 
       ^

`);
        });
    });

});