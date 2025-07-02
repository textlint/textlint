/**
 * @fileoverview Tests for unix-style formatter.
 * @author oshi-shinobu
 * @copyright 2015 oshi-shinobu. All rights reserved.
 */

import formatter from "../../src/formatters/unix.js";
import type { TextlintResult } from "@textlint/types";
import { createTestMessage, createTestResult } from "../test-helper";

import { describe, it } from "vitest";

import * as assert from "node:assert";

describe("formatter:compact", function () {
    describe("when passed no messages", function () {
        const code: TextlintResult[] = [
            createTestResult({
                filePath: "foo.js",
                messages: []
            })
        ];

        it("should return nothing", function () {
            const result = formatter(code as TextlintResult[]);
            assert.equal(result, "");
        });
    });

    describe("when passed a single message", function () {
        const code: TextlintResult[] = [
            createTestResult({
                filePath: "foo.js",
                messages: [
                    createTestMessage({
                        message: "Unexpected foo.",
                        severity: 2,
                        line: 5,
                        column: 10,
                        ruleId: "foo"
                    })
                ]
            })
        ];

        it("should return a string in the format filename:line:column: error [Error/rule_id]", function () {
            const result = formatter(code as TextlintResult[]);
            assert.equal(result, "foo.js:5:10: Unexpected foo. [Error/foo]\n\n1 problem");
        });

        it("should return a string in the format filename:line:column: warning [Warning/rule_id]", function () {
            code[0].messages[0].severity = 1;
            const result = formatter(code as TextlintResult[]);
            assert.equal(result, "foo.js:5:10: Unexpected foo. [Warning/foo]\n\n1 problem");
        });

        it("should return a string in the format filename:line:column: info [Info/rule_id]", function () {
            code[0].messages[0].severity = 3;
            const result = formatter(code as TextlintResult[]);
            assert.equal(result, "foo.js:5:10: Unexpected foo. [Info/foo]\n\n1 problem");
        });
    });

    describe("when passed a fatal error message", function () {
        const code: TextlintResult[] = [
            createTestResult({
                filePath: "foo.js",
                messages: [
                    createTestMessage({
                        fatal: true,
                        message: "Unexpected foo.",
                        line: 5,
                        column: 10,
                        ruleId: "foo"
                    })
                ]
            })
        ];

        it("should return a string in the format filename:line:column: error [Error/rule_id]", function () {
            const result = formatter(code as TextlintResult[]);
            assert.equal(result, "foo.js:5:10: Unexpected foo. [Error/foo]\n\n1 problem");
        });
    });

    describe("when passed multiple messages", function () {
        const code: TextlintResult[] = [
            createTestResult({
                filePath: "foo.js",
                messages: [
                    createTestMessage({
                        message: "Unexpected foo.",
                        severity: 2,
                        line: 5,
                        column: 10,
                        ruleId: "foo"
                    }),
                    createTestMessage({
                        message: "Unexpected bar.",
                        severity: 1,
                        line: 6,
                        column: 11,
                        ruleId: "bar"
                    })
                ]
            })
        ];

        it("should return a string with multiple entries", function () {
            const result = formatter(code as TextlintResult[]);
            assert.equal(
                result,
                "foo.js:5:10: Unexpected foo. [Error/foo]\nfoo.js:6:11: Unexpected bar. [Warning/bar]\n\n2 problems"
            );
        });
    });

    describe("when passed multiple files with 1 message each", function () {
        const code: TextlintResult[] = [
            createTestResult({
                filePath: "foo.js",
                messages: [
                    createTestMessage({
                        message: "Unexpected foo.",
                        severity: 2,
                        line: 5,
                        column: 10,
                        ruleId: "foo"
                    })
                ]
            }),
            createTestResult({
                filePath: "bar.js",
                messages: [
                    createTestMessage({
                        message: "Unexpected bar.",
                        severity: 1,
                        line: 6,
                        column: 11,
                        ruleId: "bar"
                    })
                ]
            })
        ];

        it("should return a string with multiple entries", function () {
            const result = formatter(code as TextlintResult[]);
            assert.equal(
                result,
                "foo.js:5:10: Unexpected foo. [Error/foo]\nbar.js:6:11: Unexpected bar. [Warning/bar]\n\n2 problems"
            );
        });
    });

    describe("when passed one file not found message", function () {
        const code: TextlintResult[] = [
            createTestResult({
                filePath: "foo.js",
                messages: [
                    createTestMessage({
                        fatal: true,
                        message: "Couldn't find foo.js.",
                        line: 0,
                        column: 0
                    })
                ]
            })
        ];

        it("should return a string without line and column", function () {
            const result = formatter(code as TextlintResult[]);
            assert.equal(result, "foo.js:0:0: Couldn't find foo.js. [Error]\n\n1 problem");
        });
    });
});
