/**
 * @fileoverview Tests for options.
 * @author Nicholas C. Zakas
 */

import formatter from "../../src/formatters/compact";
import { describe, it } from "vitest";
import * as assert from "node:assert";
import type { TextlintResult } from "@textlint/types";
import { createTestMessage, createTestResult } from "../test-helper";

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

        it("should return a string in the format filename: line x, col y, Error - z for errors", function () {
            const result = formatter(code as TextlintResult[]);
            assert.equal(result, "foo.js: line 5, col 10, Error - Unexpected foo. (foo)\n\n1 problem");
        });

        it("should return a string in the format filename: line x, col y, Warning - z for warnings", function () {
            code[0].messages[0].severity = 1;
            const result = formatter(code as TextlintResult[]);
            assert.equal(result, "foo.js: line 5, col 10, Warning - Unexpected foo. (foo)\n\n1 problem");
        });

        it("should return a string in the format filename: line x, col y, Info - z for info", function () {
            code[0].messages[0].severity = 3;
            const result = formatter(code as TextlintResult[]);
            assert.equal(result, "foo.js: line 5, col 10, Info - Unexpected foo. (foo)\n\n1 problem");
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

        it("should return a string in the format filename: line x, col y, Error - z", function () {
            const result = formatter(code as TextlintResult[]);
            assert.equal(result, "foo.js: line 5, col 10, Error - Unexpected foo. (foo)\n\n1 problem");
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
                "foo.js: line 5, col 10, Error - Unexpected foo. (foo)\nfoo.js: line 6, col 11, Warning - Unexpected bar. (bar)\n\n2 problems"
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
                "foo.js: line 5, col 10, Error - Unexpected foo. (foo)\nbar.js: line 6, col 11, Warning - Unexpected bar. (bar)\n\n2 problems"
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
            assert.equal(result, "foo.js: line 0, col 0, Error - Couldn't find foo.js.\n\n1 problem");
        });
    });
});
