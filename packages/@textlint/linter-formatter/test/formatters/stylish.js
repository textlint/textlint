/**
 * @fileoverview Tests for options.
 * @author Sindre Sorhus
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import * as assert from "assert";
const chalk = require("chalk");
const proxyquire = require("proxyquire");
const sinon = require("sinon");

// Chalk protects its methods so we need to inherit from it
// for Sinon to work.
const chalkStub = Object.create(chalk, {
    yellow: {
        value(str) {
            return chalk.yellow(str);
        },
        writable: true
    },
    red: {
        value(str) {
            return chalk.red(str);
        },
        writable: true
    }
});
chalkStub.yellow.bold = chalk.yellow.bold;
chalkStub.red.bold = chalk.red.bold;

const formatter = proxyquire("../../src/formatters/stylish", { chalk: chalkStub }).default;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("formatter:stylish", function() {
    let sandbox;
    const colorsEnabled = chalk.enabled;

    beforeEach(function() {
        chalk.enabled = false;
        sandbox = sinon.sandbox.create();
        sandbox.spy(chalkStub.yellow, "bold");
        sandbox.spy(chalkStub.red, "bold");
    });

    afterEach(function() {
        sandbox.verifyAndRestore();
        chalk.enabled = colorsEnabled;
    });

    describe("when passed no messages", function() {
        const code = [
            {
                filePath: "foo.js",
                messages: []
            }
        ];

        it("should not return message", function() {
            const result = formatter(code, { color: false });
            assert.strictEqual(result, "");
            assert.strictEqual(chalkStub.yellow.bold.callCount, 0);
            assert.strictEqual(chalkStub.red.bold.callCount, 0);
        });
    });

    describe("when passed a single message", function() {
        const code = [
            {
                filePath: "foo.js",
                messages: [
                    {
                        message: "Unexpected foo.",
                        severity: 2,
                        line: 5,
                        column: 10,
                        ruleId: "foo"
                    }
                ]
            }
        ];

        it("should return a string in the correct format for errors", function() {
            const result = formatter(code, { color: false });
            assert.strictEqual(
                result,
                "\nfoo.js\n  5:10  error  Unexpected foo  foo\n\n\u2716 1 problem (1 error, 0 warnings)\n"
            );
            assert.strictEqual(chalkStub.yellow.bold.callCount, 0);
            assert.strictEqual(chalkStub.red.bold.callCount, 1);
        });

        it("should return a string in the correct format for warnings", function() {
            code[0].messages[0].severity = 1;
            const result = formatter(code, { color: false });
            assert.strictEqual(
                result,
                "\nfoo.js\n  5:10  warning  Unexpected foo  foo\n\n\u2716 1 problem (0 errors, 1 warning)\n"
            );
            assert.strictEqual(chalkStub.yellow.bold.callCount, 1);
            assert.strictEqual(chalkStub.red.bold.callCount, 0);
        });
    });

    describe("when passed a fatal error message", function() {
        const code = [
            {
                filePath: "foo.js",
                messages: [
                    {
                        fatal: true,
                        message: "Unexpected foo.",
                        line: 5,
                        column: 10,
                        ruleId: "foo"
                    }
                ]
            }
        ];

        it("should return a string in the correct format", function() {
            const result = formatter(code, { color: false });
            assert.strictEqual(
                result,
                "\nfoo.js\n  5:10  error  Unexpected foo  foo\n\n\u2716 1 problem (1 error, 0 warnings)\n"
            );
            assert.strictEqual(chalkStub.yellow.bold.callCount, 0);
            assert.strictEqual(chalkStub.red.bold.callCount, 1);
        });
    });

    describe("when passed multiple messages", function() {
        const code = [
            {
                filePath: "foo.js",
                messages: [
                    {
                        message: "Unexpected foo.",
                        severity: 2,
                        line: 5,
                        column: 10,
                        ruleId: "foo"
                    },
                    {
                        message: "Unexpected bar.",
                        severity: 1,
                        line: 6,
                        column: 11,
                        ruleId: "bar"
                    }
                ]
            }
        ];

        it("should return a string with multiple entries", function() {
            const result = formatter(code, { color: false });
            assert.strictEqual(
                result,
                "\nfoo.js\n  5:10  error    Unexpected foo  foo\n  6:11  warning  Unexpected bar  bar\n\n\u2716 2 problems (1 error, 1 warning)\n"
            );
            assert.strictEqual(chalkStub.yellow.bold.callCount, 0);
            assert.strictEqual(chalkStub.red.bold.callCount, 1);
        });
    });

    describe("when passed multiple files with 1 message each", function() {
        const code = [
            {
                filePath: "foo.js",
                messages: [
                    {
                        message: "Unexpected foo.",
                        severity: 2,
                        line: 5,
                        column: 10,
                        ruleId: "foo"
                    }
                ]
            },
            {
                filePath: "bar.js",
                messages: [
                    {
                        message: "Unexpected bar.",
                        severity: 1,
                        line: 6,
                        column: 11,
                        ruleId: "bar"
                    }
                ]
            }
        ];

        it("should return a string with multiple entries", function() {
            const result = formatter(code, { color: false });
            assert.strictEqual(
                result,
                "\nfoo.js\n  5:10  error  Unexpected foo  foo\n\nbar.js\n  6:11  warning  Unexpected bar  bar\n\n\u2716 2 problems (1 error, 1 warning)\n"
            );
            assert.strictEqual(chalkStub.yellow.bold.callCount, 0);
            assert.strictEqual(chalkStub.red.bold.callCount, 1);
        });
    });

    describe("when passed multiple files with 1 message each and fixable", function() {
        const code = [
            {
                filePath: "foo.js",
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
            },
            {
                filePath: "bar.js",
                messages: [
                    {
                        message: "Unexpected bar.",
                        severity: 1,
                        line: 6,
                        column: 11,
                        ruleId: "bar",
                        fix: {
                            range: [50, 55],
                            text: "fixed 2"
                        }
                    }
                ]
            }
        ];

        it("should return a string with multiple entries", function() {
            const result = formatter(code, { color: false });
            assert.strictEqual(
                result,
                "\nfoo.js\n  " +
                    "5:10  \u2713 error  Unexpected foo  foo\n\nbar.js\n  " +
                    "6:11  \u2713 warning  Unexpected bar  bar\n\n" +
                    "\u2716 2 problems (1 error, 1 warning)\n" +
                    "\u2713 2 fixable problems.\n" +
                    "Try to run: $ textlint --fix [file]\n"
            );
            assert.strictEqual(chalkStub.yellow.bold.callCount, 0);
            assert.strictEqual(chalkStub.red.bold.callCount, 1);
        });
    });
    describe("when passed one file not found message", function() {
        const code = [
            {
                filePath: "foo.js",
                messages: [
                    {
                        fatal: true,
                        message: "Couldn't find foo.js."
                    }
                ]
            }
        ];

        it("should return a string without line and column", function() {
            const result = formatter(code, { color: false });
            assert.strictEqual(
                result,
                "\nfoo.js\n  0:0  error  Couldn't find foo.js\n\n\u2716 1 problem (1 error, 0 warnings)\n"
            );
            assert.strictEqual(chalkStub.yellow.bold.callCount, 0);
            assert.strictEqual(chalkStub.red.bold.callCount, 1);
        });
    });
});
