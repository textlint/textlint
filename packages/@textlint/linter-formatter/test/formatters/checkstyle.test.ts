/**
 * @fileoverview Tests for checkstyle reporter.
 * @author Ian Christian Myers
 */

import formatter from "../../src/formatters/checkstyle";
import { describe, it } from "vitest";
import * as assert from "node:assert";
import type { TextlintResult } from "@textlint/types";
import { createTestMessage, createTestResult } from "../test-helper";

describe("formatter:checkstyle", function () {
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
            assert.equal(
                result,
                '<?xml version="1.0" encoding="utf-8"?><checkstyle version="4.3"><file name="foo.js"><error line="5" column="10" severity="error" message="Unexpected foo. (foo)" source="eslint.rules.foo" /></file></checkstyle>'
            );
        });

        it("should return a string in the format filename: line x, col y, Warning - z for warnings", function () {
            code[0].messages[0].severity = 1;
            const result = formatter(code as TextlintResult[]);
            assert.equal(
                result,
                '<?xml version="1.0" encoding="utf-8"?><checkstyle version="4.3"><file name="foo.js"><error line="5" column="10" severity="warning" message="Unexpected foo. (foo)" source="eslint.rules.foo" /></file></checkstyle>'
            );
        });

        it("should return a string in the format filename: line x, col y, Info - z for info", function () {
            code[0].messages[0].severity = 3;
            const result = formatter(code as TextlintResult[]);
            assert.equal(
                result,
                '<?xml version="1.0" encoding="utf-8"?><checkstyle version="4.3"><file name="foo.js"><error line="5" column="10" severity="info" message="Unexpected foo. (foo)" source="eslint.rules.foo" /></file></checkstyle>'
            );
        });
    });

    describe("when passed a message with XML control characters", function () {
        it("should return a string in the format filename: line x, col y, Error - z", function () {
            const code: TextlintResult[] = [
                createTestResult({
                    filePath: "<>&\"'.js",
                    messages: [
                        createTestMessage({
                            fatal: true,
                            message: "Unexpected <>&\"'.",
                            line: "<" as unknown as number,
                            column: ">" as unknown as number,
                            ruleId: "foo>"
                        })
                    ]
                })
            ];
            const result = formatter(code as TextlintResult[]);
            assert.equal(
                result,
                '<?xml version="1.0" encoding="utf-8"?><checkstyle version="4.3"><file name="&lt;&gt;&amp;&quot;&apos;.js"><error line="&lt;" column="&gt;" severity="error" message="Unexpected &lt;&gt;&amp;&quot;&apos;. (foo&gt;)" source="eslint.rules.foo&gt;" /></file></checkstyle>'
            );
        });
    });

    describe("when passed a fatal error message", function () {
        it("should return a string in the format filename: line x, col y, Error - z", function () {
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
            const result = formatter(code as TextlintResult[]);
            assert.equal(
                result,
                '<?xml version="1.0" encoding="utf-8"?><checkstyle version="4.3"><file name="foo.js"><error line="5" column="10" severity="error" message="Unexpected foo. (foo)" source="eslint.rules.foo" /></file></checkstyle>'
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

        it("should return a string with multiple entries", function () {
            const result = formatter(code as TextlintResult[]);
            assert.equal(
                result,
                '<?xml version="1.0" encoding="utf-8"?><checkstyle version="4.3"><file name="foo.js"><error line="5" column="10" severity="error" message="Unexpected foo. (foo)" source="eslint.rules.foo" /><error line="6" column="11" severity="warning" message="Unexpected bar. (bar)" source="eslint.rules.bar" /></file></checkstyle>'
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
                '<?xml version="1.0" encoding="utf-8"?><checkstyle version="4.3"><file name="foo.js"><error line="5" column="10" severity="error" message="Unexpected foo. (foo)" source="eslint.rules.foo" /></file><file name="bar.js"><error line="6" column="11" severity="warning" message="Unexpected bar. (bar)" source="eslint.rules.bar" /></file></checkstyle>'
            );
        });
    });

    describe("when passing single message without rule id", function () {
        const code: TextlintResult[] = [
            createTestResult({
                filePath: "foo.js",
                messages: [
                    createTestMessage({
                        message: "Unexpected foo.",
                        severity: 2,
                        line: 5,
                        column: 10
                    })
                ]
            })
        ];

        it("should return a string in the format filename: line x, col y, Error - z for errors", function () {
            const result = formatter(code as TextlintResult[]);
            assert.equal(
                result,
                '<?xml version="1.0" encoding="utf-8"?><checkstyle version="4.3"><file name="foo.js"><error line="5" column="10" severity="error" message="Unexpected foo." source="" /></file></checkstyle>'
            );
        });
    });
});
