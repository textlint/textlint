/**
 * @fileoverview Tests for options.
 * @author Jonathan Kingston
 */

import formatter from "../../src/formatters/tap.js";
import type { TextlintResult } from "@textlint/types";
import { createTestMessage, createTestResult } from "../test-helper";

import { describe, it } from "vitest";

import * as assert from "node:assert";

describe("formatter:tap", function () {
    describe("when passed no messages", function () {
        const code: TextlintResult[] = [
            createTestResult({
                filePath: "foo.js",
                messages: []
            })
        ];

        it("should return nothing", function () {
            const result = formatter(code as TextlintResult[]);
            assert.equal(result, "TAP version 13\n1..1\nok 1 - foo.js\n");
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

        it("should return a string with YAML severity, line and column", function () {
            const result = formatter(code as TextlintResult[]);
            assert.equal(
                result,
                "TAP version 13\n1..1\nnot ok 1 - foo.js\n  ---\n  message: Unexpected foo.\n  severity: error\n  data:\n    line: 5\n    column: 10\n    ruleId: foo\n  ...\n"
            );
        });

        it("should return a string with line: x, column: y, severity: warning for warnings", function () {
            code[0].messages[0].severity = 1;
            const result = formatter(code as TextlintResult[]);
            assert.ok(result.indexOf("line: 5") !== -1);
            assert.ok(result.indexOf("column: 10") !== -1);
            assert.ok(result.indexOf("ruleId: foo") !== -1);
            assert.ok(result.indexOf("severity: warning") !== -1);
            assert.ok(result.indexOf("1..1") !== -1);
        });

        it("should return a string with line: x, column: y, severity: info for info", function () {
            code[0].messages[0].severity = 3;
            const result = formatter(code as TextlintResult[]);
            assert.ok(result.indexOf("line: 5") !== -1);
            assert.ok(result.indexOf("column: 10") !== -1);
            assert.ok(result.indexOf("ruleId: foo") !== -1);
            assert.ok(result.indexOf("severity: info") !== -1);
            assert.ok(result.indexOf("1..1") !== -1);
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

        it("should return a an error string", function () {
            const result = formatter(code as TextlintResult[]);
            assert.ok(result.indexOf("not ok") !== -1);
            assert.ok(result.indexOf("error") !== -1);
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
                    }),
                    createTestMessage({
                        message: "Unexpected baz.",
                        severity: 1,
                        line: 7,
                        column: 12,
                        ruleId: "baz"
                    })
                ]
            })
        ];

        it("should return a string with multiple entries", function () {
            const result = formatter(code as TextlintResult[]);
            assert.ok(result.indexOf("not ok") !== -1);
            assert.ok(result.indexOf("messages") !== -1);
            assert.ok(result.indexOf("Unexpected foo.") !== -1);
            assert.ok(result.indexOf("line: 5") !== -1);
            assert.ok(result.indexOf("column: 10") !== -1);
            assert.ok(result.indexOf("Unexpected bar.") !== -1);
            assert.ok(result.indexOf("line: 6") !== -1);
            assert.ok(result.indexOf("column: 11") !== -1);
            assert.ok(result.indexOf("Unexpected baz.") !== -1);
            assert.ok(result.indexOf("line: 7") !== -1);
            assert.ok(result.indexOf("column: 12") !== -1);
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
            assert.ok(result.indexOf("not ok 1") !== -1);
            assert.ok(result.indexOf("not ok 2") !== -1);
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
            assert.ok(result.indexOf("line: 0") !== -1);
            assert.ok(result.indexOf("column: 0") !== -1);
            assert.ok(result.indexOf("severity: error") !== -1);
            assert.ok(result.indexOf("1..1") !== -1);
        });
    });
});
