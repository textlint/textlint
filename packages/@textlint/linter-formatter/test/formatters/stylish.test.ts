/**
 * @fileoverview Tests for stylish formatter.
 */

import { describe, it, expect } from "vitest";
import stylish from "../../src/formatters/stylish.js";
import type { TextlintResult, TextlintMessage } from "@textlint/types";

const formatter = (code: TextlintResult[]) => {
    return stylish(code, { color: false });
};

// Helper function to create proper TextlintMessage objects
const createMessage = (overrides: Partial<TextlintMessage> = {}): TextlintMessage => ({
    type: "lint",
    ruleId: "test-rule",
    message: "Test message",
    line: 1,
    column: 1,
    index: 0,
    range: [0, 1] as const,
    loc: {
        start: { line: 1, column: 1 },
        end: { line: 1, column: 2 }
    },
    severity: 2,
    ...overrides
});

describe("formatter:stylish", function () {
    describe("when passed no messages", function () {
        const code = [
            {
                filePath: "foo.js",
                messages: []
            }
        ];

        it("should not return message", function () {
            const result = formatter(code);
            expect(result).toMatchInlineSnapshot(`""`);
        });
    });

    describe("when passed a single message", function () {
        it("should return a string in the correct format for errors", function () {
            const code: TextlintResult[] = [
                {
                    filePath: "foo.js",
                    messages: [
                        createMessage({
                            message: "Unexpected foo.",
                            severity: 2,
                            line: 5,
                            column: 10,
                            ruleId: "foo",
                            range: [40, 41] as const,
                            loc: {
                                start: { line: 5, column: 10 },
                                end: { line: 5, column: 11 }
                            },
                            index: 40
                        })
                    ]
                }
            ];
            const result = formatter(code);
            expect(result).toMatchInlineSnapshot(`
              "
              foo.js
                5:10  error  Unexpected foo  foo

              ✖ 1 problem (1 error, 0 warnings, 0 infos)
              "
            `);
        });

        it("should return a string in the correct format for warnings", function () {
            const code: TextlintResult[] = [
                {
                    filePath: "foo.js",
                    messages: [
                        createMessage({
                            message: "Unexpected foo.",
                            severity: 1,
                            line: 5,
                            column: 10,
                            ruleId: "foo",
                            range: [40, 41] as const,
                            loc: {
                                start: { line: 5, column: 10 },
                                end: { line: 5, column: 11 }
                            },
                            index: 40
                        })
                    ]
                }
            ];
            const result = formatter(code);
            expect(result).toMatchInlineSnapshot(`
              "
              foo.js
                5:10  warning  Unexpected foo  foo

              ✖ 1 problem (0 errors, 1 warning, 0 infos)
              "
            `);
        });

        it("should return a string in the correct format for info", function () {
            const code: TextlintResult[] = [
                {
                    filePath: "foo.js",
                    messages: [
                        createMessage({
                            message: "Unexpected foo.",
                            severity: 3,
                            line: 5,
                            column: 10,
                            ruleId: "foo",
                            range: [40, 41] as const,
                            loc: {
                                start: { line: 5, column: 10 },
                                end: { line: 5, column: 11 }
                            },
                            index: 40
                        })
                    ]
                }
            ];
            const result = formatter(code);
            expect(result).toMatchInlineSnapshot(`
              "
              foo.js
                5:10  info  Unexpected foo  foo

              ✖ 1 problem (0 errors, 0 warnings, 1 info)
              "
            `);
        });
    });

    describe("when passed a fatal error message", function () {
        const code: TextlintResult[] = [
            {
                filePath: "foo.js",
                messages: [
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    createMessage({
                        message: "Unexpected foo.",
                        line: 5,
                        column: 10,
                        ruleId: "foo",
                        range: [40, 41] as const,
                        loc: {
                            start: { line: 5, column: 10 },
                            end: { line: 5, column: 11 }
                        },
                        index: 40
                    }) as any // Need any cast for fatal property
                ]
            }
        ];

        it("should return a string in the correct format", function () {
            const result = formatter(code);
            expect(result).toMatchInlineSnapshot(`
              "
              foo.js
                5:10  error  Unexpected foo  foo

              ✖ 1 problem (1 error, 0 warnings, 0 infos)
              "
            `);
        });
    });

    describe("when passed multiple messages", function () {
        const code: TextlintResult[] = [
            {
                filePath: "foo.js",
                messages: [
                    createMessage({
                        message: "Unexpected foo.",
                        severity: 2,
                        line: 5,
                        column: 10,
                        ruleId: "foo",
                        range: [40, 41] as const,
                        loc: {
                            start: { line: 5, column: 10 },
                            end: { line: 5, column: 11 }
                        },
                        index: 40
                    }),
                    createMessage({
                        message: "Unexpected bar.",
                        severity: 1,
                        line: 6,
                        column: 11,
                        ruleId: "bar",
                        range: [50, 51] as const,
                        loc: {
                            start: { line: 6, column: 11 },
                            end: { line: 6, column: 12 }
                        },
                        index: 50
                    })
                ]
            }
        ];

        it("should return a string with multiple entries", function () {
            const result = formatter(code);
            expect(result).toMatchInlineSnapshot(`
              "
              foo.js
                5:10  error    Unexpected foo  foo
                6:11  warning  Unexpected bar  bar

              ✖ 2 problems (1 error, 1 warning, 0 infos)
              "
            `);
        });
    });

    describe("when passed multiple files with 1 message each", function () {
        const code: TextlintResult[] = [
            {
                filePath: "foo.js",
                messages: [
                    createMessage({
                        message: "Unexpected foo.",
                        severity: 2,
                        line: 5,
                        column: 10,
                        ruleId: "foo",
                        range: [40, 41] as const,
                        loc: {
                            start: { line: 5, column: 10 },
                            end: { line: 5, column: 11 }
                        },
                        index: 40
                    })
                ]
            },
            {
                filePath: "bar.js",
                messages: [
                    createMessage({
                        message: "Unexpected bar.",
                        severity: 1,
                        line: 6,
                        column: 11,
                        ruleId: "bar",
                        range: [50, 51] as const,
                        loc: {
                            start: { line: 6, column: 11 },
                            end: { line: 6, column: 12 }
                        },
                        index: 50
                    })
                ]
            }
        ];

        it("should return a string with multiple entries", function () {
            const result = formatter(code);
            expect(result).toMatchInlineSnapshot(`
              "
              foo.js
                5:10  error  Unexpected foo  foo

              bar.js
                6:11  warning  Unexpected bar  bar

              ✖ 2 problems (1 error, 1 warning, 0 infos)
              "
            `);
        });
    });

    describe("when passed multiple files with 1 message each and fixable", function () {
        const code: TextlintResult[] = [
            {
                filePath: "foo.js",
                messages: [
                    createMessage({
                        message: "Unexpected foo.",
                        severity: 2,
                        line: 5,
                        column: 10,
                        ruleId: "foo",
                        range: [40, 45] as const,
                        loc: {
                            start: { line: 5, column: 10 },
                            end: { line: 5, column: 15 }
                        },
                        index: 40,
                        fix: {
                            range: [40, 45] as const,
                            text: "fixed 1"
                        }
                    })
                ]
            },
            {
                filePath: "bar.js",
                messages: [
                    createMessage({
                        message: "Unexpected bar.",
                        severity: 1,
                        line: 6,
                        column: 11,
                        ruleId: "bar",
                        range: [50, 55] as const,
                        loc: {
                            start: { line: 6, column: 11 },
                            end: { line: 6, column: 16 }
                        },
                        index: 50,
                        fix: {
                            range: [50, 55] as const,
                            text: "fixed 2"
                        }
                    })
                ]
            }
        ];

        it("should return a string with multiple entries", function () {
            const result = formatter(code);
            expect(result).toMatchInlineSnapshot(`
              "
              foo.js
                5:10  ✓ error  Unexpected foo  foo

              bar.js
                6:11  ✓ warning  Unexpected bar  bar

              ✖ 2 problems (1 error, 1 warning, 0 infos)
              ✓ 2 fixable problems.
              Try to run: $ textlint --fix [file]
              "
            `);
        });
    });

    describe("when passed one file not found message", function () {
        const code: TextlintResult[] = [
            {
                filePath: "foo.js",
                messages: [
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    createMessage({
                        message: "Couldn't find foo.js.",
                        ruleId: "",
                        line: 0,
                        column: 0,
                        range: [0, 0] as const,
                        loc: {
                            start: { line: 0, column: 0 },
                            end: { line: 0, column: 0 }
                        },
                        index: 0
                    }) as any // Need any cast for fatal property
                ]
            }
        ];

        it("should return a string without line and column", function () {
            const result = formatter(code);
            expect(result).toMatchInlineSnapshot(`
              "
              foo.js
                0:0  error  Couldn't find foo.js

              ✖ 1 problem (1 error, 0 warnings, 0 infos)
              "
            `);
        });
    });
});
