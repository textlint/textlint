/**
 * @fileoverview Tests for JSLint XML reporter.
 * @author Ian Christian Myers
 */

import formatter from "../../src/formatters/jslint-xml";
import { describe, it } from "vitest";
import * as assert from "node:assert";
import type { TextlintResult } from "@textlint/types";
import { createTestMessage, createTestResult } from "../test-helper";

describe("formatter:jslint-xml", function () {
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

        it("should return a string in JSLint XML format with 1 issue in 1 file", function () {
            const result = formatter(code as TextlintResult[]);
            assert.equal(
                result,
                '<?xml version="1.0" encoding="utf-8"?><jslint><file name="foo.js"><issue line="5" char="10" evidence="" reason="Unexpected foo. (foo)" /></file></jslint>'
            );
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

        it("should return a string in JSLint XML format with 1 issue in 1 file", function () {
            const result = formatter(code as TextlintResult[]);
            assert.equal(
                result,
                '<?xml version="1.0" encoding="utf-8"?><jslint><file name="foo.js"><issue line="5" char="10" evidence="" reason="Unexpected foo. (foo)" /></file></jslint>'
            );
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

        it("should return a string in JSLint XML format with 2 issues in 1 file", function () {
            const result = formatter(code as TextlintResult[]);
            assert.equal(
                result,
                '<?xml version="1.0" encoding="utf-8"?><jslint><file name="foo.js"><issue line="5" char="10" evidence="" reason="Unexpected foo. (foo)" /><issue line="6" char="11" evidence="" reason="Unexpected bar. (bar)" /></file></jslint>'
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

        it("should return a string in JSLint XML format with 2 issues in 2 files", function () {
            const result = formatter(code as TextlintResult[]);
            assert.equal(
                result,
                '<?xml version="1.0" encoding="utf-8"?><jslint><file name="foo.js"><issue line="5" char="10" evidence="" reason="Unexpected foo. (foo)" /></file><file name="bar.js"><issue line="6" char="11" evidence="" reason="Unexpected bar. (bar)" /></file></jslint>'
            );
        });
    });

    describe("when passing a single message with illegal characters", function () {
        const code: TextlintResult[] = [
            createTestResult({
                filePath: "foo.js",
                messages: [
                    createTestMessage({
                        message: "Unexpected <&\"'> foo.",
                        severity: 2,
                        line: 5,
                        column: 10,
                        ruleId: "foo"
                    })
                ]
            })
        ];

        it("should return a string in JSLint XML format with 1 issue in 1 file", function () {
            const result = formatter(code as TextlintResult[]);
            assert.equal(
                result,
                '<?xml version="1.0" encoding="utf-8"?><jslint><file name="foo.js"><issue line="5" char="10" evidence="" reason="Unexpected &lt;&amp;&quot;&#39;&gt; foo. (foo)" /></file></jslint>'
            );
        });
    });

    describe("when passing a single message with no source", function () {
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

        it("should return a string in JSLint XML format with 1 issue in 1 file", function () {
            const result = formatter(code as TextlintResult[]);
            assert.equal(
                result,
                '<?xml version="1.0" encoding="utf-8"?><jslint><file name="foo.js"><issue line="5" char="10" evidence="" reason="Unexpected foo. (foo)" /></file></jslint>'
            );
        });
    });

    describe("when passing a single message without rule id", function () {
        const code: TextlintResult[] = [
            createTestResult({
                filePath: "foo.js",
                messages: [
                    createTestMessage({
                        severity: 2,
                        line: 5,
                        column: 10
                    })
                ]
            })
        ];

        it("should return a string in JSLint XML format with 1 issue in 1 file", function () {
            const result = formatter(code as TextlintResult[]);
            assert.equal(
                result,
                '<?xml version="1.0" encoding="utf-8"?><jslint><file name="foo.js"><issue line="5" char="10" evidence="" reason="" /></file></jslint>'
            );
        });
    });
});
