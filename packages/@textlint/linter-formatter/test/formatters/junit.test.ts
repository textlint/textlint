/**
 * @fileoverview Tests for jUnit Formatter.
 * @author Jamund Ferguson
 */

/* jshint node:true */

import formatter from "../../src/formatters/junit.js";
import type { TextlintResult, TextlintMessage } from "@textlint/types";

import { describe, it } from "vitest";

import * as assert from "node:assert";

// Helper to create test message with minimal required properties and support for fatal
function createTestMessage(overrides: Partial<TextlintMessage> & { fatal?: boolean } = {}): TextlintMessage & { fatal?: boolean } {
    return {
        type: "lint",
        ruleId: "",
        message: "",
        line: 1,
        column: 1,
        index: 0,
        range: [0, 1] as const,
        loc: {
            start: { line: 1, column: 1 },
            end: { line: 1, column: 1 }
        },
        severity: 1,
        ...overrides
    };
}


describe("formatter:junit", function () {
    describe("when there are no problems", function () {
        const code: TextlintResult[] = [];

        it("should not complain about anything", function () {
            const result = formatter(code as TextlintResult[]);
            assert.equal(result.replace(/\n/g, ""), '<?xml version="1.0" encoding="utf-8"?><testsuites></testsuites>');
        });
    });

    describe("when passed a single message", function () {
        const code: TextlintResult[] = [
            {
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
            }
        ];

        it("should return a single <testcase> with a message and the line and col number in the body (error)", function () {
            const result = formatter(code as TextlintResult[]);
            assert.equal(
                result.replace(/\n/g, ""),
                '<?xml version="1.0" encoding="utf-8"?><testsuites><testsuite package="org.eslint" time="0" tests="1" errors="1" name="foo.js"><testcase time="0" name="org.eslint.foo"><failure message="Unexpected foo."><![CDATA[line 5, col 10, Error - Unexpected foo. (foo)]]></failure></testcase></testsuite></testsuites>'
            );
        });

        it("should return a single <testcase> with a message and the line and col number in the body (warning)", function () {
            code[0].messages[0].severity = 1;
            const result = formatter(code as TextlintResult[]);
            assert.equal(
                result.replace(/\n/g, ""),
                '<?xml version="1.0" encoding="utf-8"?><testsuites><testsuite package="org.eslint" time="0" tests="1" errors="1" name="foo.js"><testcase time="0" name="org.eslint.foo"><failure message="Unexpected foo."><![CDATA[line 5, col 10, Warning - Unexpected foo. (foo)]]></failure></testcase></testsuite></testsuites>'
            );
        });

        it("should return a single <testcase> with a message and the line and col number in the body (info)", function () {
            code[0].messages[0].severity = 3;
            const result = formatter(code as TextlintResult[]);
            assert.equal(
                result.replace(/\n/g, ""),
                '<?xml version="1.0" encoding="utf-8"?><testsuites><testsuite package="org.eslint" time="0" tests="1" errors="1" name="foo.js"><testcase time="0" name="org.eslint.foo"><failure message="Unexpected foo."><![CDATA[line 5, col 10, Info - Unexpected foo. (foo)]]></failure></testcase></testsuite></testsuites>'
            );
        });
    });

    describe("when passed a fatal error message", function () {
        const code: TextlintResult[] = [
            {
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
            }
        ];

        it("should return a single <testcase> and an <error>", function () {
            const result = formatter(code as TextlintResult[]);
            assert.equal(
                result.replace(/\n/g, ""),
                '<?xml version="1.0" encoding="utf-8"?><testsuites><testsuite package="org.eslint" time="0" tests="1" errors="1" name="foo.js"><testcase time="0" name="org.eslint.foo"><error message="Unexpected foo."><![CDATA[line 5, col 10, Error - Unexpected foo. (foo)]]></error></testcase></testsuite></testsuites>'
            );
        });
    });

    describe("when passed a fatal error message with no line or column", function () {
        const code: TextlintResult[] = [
            {
                filePath: "foo.js",
                messages: [
                    createTestMessage({
                        fatal: true,
                        message: "Unexpected foo.",
                        line: undefined as any,
                        column: undefined as any
                    })
                ]
            }
        ];

        it("should return a single <testcase> and an <error>", function () {
            const result = formatter(code as TextlintResult[]);
            assert.equal(
                result.replace(/\n/g, ""),
                '<?xml version="1.0" encoding="utf-8"?><testsuites><testsuite package="org.eslint" time="0" tests="1" errors="1" name="foo.js"><testcase time="0" name="org.eslint.unknown"><error message="Unexpected foo."><![CDATA[line 0, col 0, Error - Unexpected foo.]]></error></testcase></testsuite></testsuites>'
            );
        });
    });

    describe("when passed a fatal error message with no line, column, or message text", function () {
        const code: TextlintResult[] = [
            {
                filePath: "foo.js",
                messages: [
                    createTestMessage({
                        fatal: true,
                        line: undefined as any,
                        column: undefined as any
                    })
                ]
            }
        ];

        it("should return a single <testcase> and an <error>", function () {
            const result = formatter(code as TextlintResult[]);
            assert.equal(
                result.replace(/\n/g, ""),
                '<?xml version="1.0" encoding="utf-8"?><testsuites><testsuite package="org.eslint" time="0" tests="1" errors="1" name="foo.js"><testcase time="0" name="org.eslint.unknown"><error message=""><![CDATA[line 0, col 0, Error - ]]></error></testcase></testsuite></testsuites>'
            );
        });
    });

    describe("when passed multiple messages", function () {
        const code: TextlintResult[] = [
            {
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
            }
        ];

        it("should return a multiple <testcase>'s", function () {
            const result = formatter(code as TextlintResult[]);
            assert.equal(
                result.replace(/\n/g, ""),
                '<?xml version="1.0" encoding="utf-8"?><testsuites><testsuite package="org.eslint" time="0" tests="2" errors="2" name="foo.js"><testcase time="0" name="org.eslint.foo"><failure message="Unexpected foo."><![CDATA[line 5, col 10, Error - Unexpected foo. (foo)]]></failure></testcase><testcase time="0" name="org.eslint.bar"><failure message="Unexpected bar."><![CDATA[line 6, col 11, Warning - Unexpected bar. (bar)]]></failure></testcase></testsuite></testsuites>'
            );
        });
    });

    describe("when passed special characters", function () {
        const code: TextlintResult[] = [
            {
                filePath: "foo.js",
                messages: [
                    createTestMessage({
                        message: "Unexpected <foo></foo>.",
                        severity: 1,
                        line: 5,
                        column: 10,
                        ruleId: "foo"
                    })
                ]
            }
        ];

        it("should make them go away", function () {
            const result = formatter(code as TextlintResult[]);
            assert.equal(
                result.replace(/\n/g, ""),
                '<?xml version="1.0" encoding="utf-8"?><testsuites><testsuite package="org.eslint" time="0" tests="1" errors="1" name="foo.js"><testcase time="0" name="org.eslint.foo"><failure message="Unexpected &lt;foo&gt;&lt;/foo&gt;."><![CDATA[line 5, col 10, Warning - Unexpected &lt;foo&gt;&lt;/foo&gt;. (foo)]]></failure></testcase></testsuite></testsuites>'
            );
        });
    });

    describe("when passed multiple files with 1 message each", function () {
        const code: TextlintResult[] = [
            {
                filePath: "foo.js",
                messages: [
                    createTestMessage({
                        message: "Unexpected foo.",
                        severity: 1,
                        line: 5,
                        column: 10,
                        ruleId: "foo"
                    })
                ]
            },
            {
                filePath: "bar.js",
                messages: [
                    createTestMessage({
                        message: "Unexpected bar.",
                        severity: 2,
                        line: 6,
                        column: 11,
                        ruleId: "bar"
                    })
                ]
            }
        ];

        it("should return 2 <testsuite>'s", function () {
            const result = formatter(code as TextlintResult[]);
            assert.equal(
                result.replace(/\n/g, ""),
                '<?xml version="1.0" encoding="utf-8"?><testsuites><testsuite package="org.eslint" time="0" tests="1" errors="1" name="foo.js"><testcase time="0" name="org.eslint.foo"><failure message="Unexpected foo."><![CDATA[line 5, col 10, Warning - Unexpected foo. (foo)]]></failure></testcase></testsuite><testsuite package="org.eslint" time="0" tests="1" errors="1" name="bar.js"><testcase time="0" name="org.eslint.bar"><failure message="Unexpected bar."><![CDATA[line 6, col 11, Error - Unexpected bar. (bar)]]></failure></testcase></testsuite></testsuites>'
            );
        });
    });

    describe("when passed multiple files with total 1 failure", function () {
        const code: TextlintResult[] = [
            {
                filePath: "foo.js",
                messages: [
                    createTestMessage({
                        message: "Unexpected foo.",
                        severity: 1,
                        line: 5,
                        column: 10,
                        ruleId: "foo"
                    })
                ]
            },
            {
                filePath: "bar.js",
                messages: []
            }
        ];

        it("should return 1 <testsuite>", function () {
            const result = formatter(code as TextlintResult[]);
            assert.equal(
                result.replace(/\n/g, ""),
                '<?xml version="1.0" encoding="utf-8"?><testsuites><testsuite package="org.eslint" time="0" tests="1" errors="1" name="foo.js"><testcase time="0" name="org.eslint.foo"><failure message="Unexpected foo."><![CDATA[line 5, col 10, Warning - Unexpected foo. (foo)]]></failure></testcase></testsuite></testsuites>'
            );
        });
    });
});
