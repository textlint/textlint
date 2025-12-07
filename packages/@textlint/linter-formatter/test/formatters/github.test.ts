/**
 * @fileoverview Tests for options.
 * @author thompson-tomo
 */

import formatter from "../../src/formatters/github";
import { describe, it } from "vitest";
import * as assert from "node:assert";
import type { TextlintResult } from "@textlint/types";
import { createTestMessage, createTestResult } from "../test-helper";

describe("formatter:github", function () {
    describe("when passed no messages", function () {
        const code: TextlintResult[] = [
            createTestResult({
                filePath: "foo.js",
                messages: []
            })
        ];

        it("should return nothing", function () {
            const result = formatter(code);
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
                        loc: {
                            start: {
                                line: 5,
                                column: 10
                            },
                            end: {
                                line: 5,
                                column: 12
                            }
                        },
                        ruleId: "foo"
                    })
                ]
            })
        ];

        it("should return a string in the github error annotation format", function () {
            const result = formatter(code);
            assert.equal(
                result,
                "::error file=foo.js,line=5,endLine=5,col=10,endColumn=12,title=TextLint->foo::Unexpected foo."
            );
        });

        it("should return a string in the github warning annotation format", function () {
            code[0].messages[0].severity = 1;
            const result = formatter(code);
            assert.equal(
                result,
                "::warning file=foo.js,line=5,endLine=5,col=10,endColumn=12,title=TextLint->foo::Unexpected foo."
            );
        });

        it("should return a string in the github info annotation format", function () {
            code[0].messages[0].severity = 3;
            const result = formatter(code);
            assert.equal(
                result,
                "::notice file=foo.js,line=5,endLine=5,col=10,endColumn=12,title=TextLint->foo::Unexpected foo."
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
                        loc: {
                            start: {
                                line: 5,
                                column: 10
                            },
                            end: {
                                line: 5,
                                column: 12
                            }
                        },
                        ruleId: "foo"
                    })
                ]
            })
        ];

        it("should return a string in the github error annotation format", function () {
            const result = formatter(code);
            assert.equal(
                result,
                "::error file=foo.js,line=5,endLine=5,col=10,endColumn=12,title=TextLint->foo::Unexpected foo."
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
                        loc: {
                            start: {
                                line: 5,
                                column: 10
                            },
                            end: {
                                line: 5,
                                column: 12
                            }
                        },
                        ruleId: "foo"
                    }),
                    createTestMessage({
                        message: "Unexpected bar.",
                        severity: 1,
                        loc: {
                            start: {
                                line: 6,
                                column: 14
                            },
                            end: {
                                line: 6,
                                column: 16
                            }
                        },
                        ruleId: "bar"
                    })
                ]
            })
        ];

        it("should return a string with multiple entries", function () {
            const result = formatter(code);
            assert.equal(
                result,
                "::error file=foo.js,line=5,endLine=5,col=10,endColumn=12,title=TextLint->foo::Unexpected foo.\n::warning file=foo.js,line=6,endLine=6,col=14,endColumn=16,title=TextLint->bar::Unexpected bar."
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
                        loc: {
                            start: {
                                line: 5,
                                column: 10
                            },
                            end: {
                                line: 5,
                                column: 12
                            }
                        },
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
                        loc: {
                            start: {
                                line: 6,
                                column: 14
                            },
                            end: {
                                line: 6,
                                column: 16
                            }
                        },
                        ruleId: "bar"
                    })
                ]
            })
        ];

        it("should return a string with multiple entries", function () {
            const result = formatter(code);
            assert.equal(
                result,
                "::error file=foo.js,line=5,endLine=5,col=10,endColumn=12,title=TextLint->foo::Unexpected foo.\n::warning file=bar.js,line=6,endLine=6,col=14,endColumn=16,title=TextLint->bar::Unexpected bar."
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
            const result = formatter(code);
            assert.equal(
                result,
                "::error file=foo.js,line=1,endLine=1,col=1,endColumn=1,title=TextLint::Couldn't find foo.js."
            );
        });
    });
});
