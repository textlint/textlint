/**
 * @fileoverview Tests for "table" reporter.
 * @author Gajus Kuizinas <gajus@gajus.com>
 * @copyright 2016 Gajus Kuizinas <gajus@gajus.com>. All rights reserved.
 */
"use strict";
import formatter from "../../src/formatters/table.js";
import type { TextlintResult } from "@textlint/types";
import { createTestMessage, createTestResult } from "../test-helper";

import { describe, it, expect } from "vitest";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("formatter:table", function () {
    describe("when passed no messages", function () {
        const code = [
            {
                ...createTestResult({
                    filePath: "foo.js",
                    messages: []
                }),
                errorCount: 0,
                warningCount: 0
            }
        ];

        it("should return a table of error and warning count with no messages", function () {
            const result = formatter(code as TextlintResult[], { color: false });

            expect(result).toMatchInlineSnapshot(`""`);
        });
    });

    describe("when passed a single message", function () {
        it("should return a string in the correct format for errors", function () {
            const code = [
                {
                    ...createTestResult({
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
                    errorCount: 1,
                    warningCount: 0
                }
            ];

            const result = formatter(code as TextlintResult[], { color: false });

            expect(result).toMatchInlineSnapshot(`
              "
              foo.js

              ║ Line     │ Column   │ Type     │ Message                                                │ Rule ID              ║
              ╟──────────┼──────────┼──────────┼────────────────────────────────────────────────────────┼──────────────────────╢
              ║ 5        │ 10       │ error    │ Unexpected foo.                                        │ foo                  ║

              ╔════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
              ║ 1 Error                                                                                                        ║
              ╚════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
              "
            `);
        });

        it("should return a string in the correct format for warnings", function () {
            const code = [
                {
                    ...createTestResult({
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
                    }),
                    errorCount: 0,
                    warningCount: 1
                }
            ];

            const result = formatter(code as TextlintResult[], { color: false });
            expect(result).toMatchInlineSnapshot(`
              "
              foo.js

              ║ Line     │ Column   │ Type     │ Message                                                │ Rule ID              ║
              ╟──────────┼──────────┼──────────┼────────────────────────────────────────────────────────┼──────────────────────╢
              ║ 5        │ 10       │ warning  │ Unexpected foo.                                        │ foo                  ║

              ╔════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
              ║ 1 Warning                                                                                                      ║
              ╚════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
              "
            `);
        });

        it("should return a string in the correct format for info", function () {
            const code = [
                {
                    ...createTestResult({
                        filePath: "foo.js",
                        messages: [
                            createTestMessage({
                                message: "Unexpected foo.",
                                severity: 3,
                                line: 5,
                                column: 10,
                                ruleId: "foo"
                            })
                        ]
                    }),
                    errorCount: 0,
                    warningCount: 0,
                    infoCount: 1
                }
            ];

            const result = formatter(code as TextlintResult[], { color: false });
            expect(result).toMatchInlineSnapshot(`
              "
              foo.js

              ║ Line     │ Column   │ Type     │ Message                                                │ Rule ID              ║
              ╟──────────┼──────────┼──────────┼────────────────────────────────────────────────────────┼──────────────────────╢
              ║ 5        │ 10       │ info     │ Unexpected foo.                                        │ foo                  ║

              ╔════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
              ║ 1 Info                                                                                                         ║
              ╚════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
              "
            `);
        });
    });

    describe("when passed a fatal error message", function () {
        it("should return a string in the correct format", function () {
            const code = [
                {
                    ...createTestResult({
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
                    }),
                    errorCount: 1,
                    warningCount: 0
                }
            ];

            const result = formatter(code as TextlintResult[], { color: false });

            expect(result).toMatchInlineSnapshot(`
              "
              foo.js

              ║ Line     │ Column   │ Type     │ Message                                                │ Rule ID              ║
              ╟──────────┼──────────┼──────────┼────────────────────────────────────────────────────────┼──────────────────────╢
              ║ 5        │ 10       │ error    │ Unexpected foo.                                        │ foo                  ║

              ╔════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
              ║ 1 Error                                                                                                        ║
              ╚════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
              "
            `);
        });
    });

    describe("when passed multiple messages", function () {
        it("should return a string with multiple entries", function () {
            const code = [
                {
                    ...createTestResult({
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
                    }),
                    errorCount: 1,
                    warningCount: 1
                }
            ];

            const result = formatter(code as TextlintResult[], { color: false });

            expect(result).toMatchInlineSnapshot(`
              "
              foo.js

              ║ Line     │ Column   │ Type     │ Message                                                │ Rule ID              ║
              ╟──────────┼──────────┼──────────┼────────────────────────────────────────────────────────┼──────────────────────╢
              ║ 5        │ 10       │ error    │ Unexpected foo.                                        │ foo                  ║
              ║ 6        │ 11       │ warning  │ Unexpected bar.                                        │ bar                  ║

              ╔════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
              ║ 1 Error                                                                                                        ║
              ╟────────────────────────────────────────────────────────────────────────────────────────────────────────────────╢
              ║ 1 Warning                                                                                                      ║
              ╚════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
              "
            `);
        });
    });

    describe("when passed multiple files with 1 message each", function () {
        it("should return a string with multiple entries", function () {
            const code = [
                {
                    ...createTestResult({
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
                    errorCount: 1,
                    warningCount: 0
                },
                {
                    ...createTestResult({
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
                    }),
                    errorCount: 0,
                    warningCount: 1
                }
            ];

            const result = formatter(code as TextlintResult[], { color: false });

            expect(result).toMatchInlineSnapshot(`
              "
              foo.js

              ║ Line     │ Column   │ Type     │ Message                                                │ Rule ID              ║
              ╟──────────┼──────────┼──────────┼────────────────────────────────────────────────────────┼──────────────────────╢
              ║ 5        │ 10       │ error    │ Unexpected foo.                                        │ foo                  ║

              bar.js

              ║ Line     │ Column   │ Type     │ Message                                                │ Rule ID              ║
              ╟──────────┼──────────┼──────────┼────────────────────────────────────────────────────────┼──────────────────────╢
              ║ 6        │ 11       │ warning  │ Unexpected bar.                                        │ bar                  ║

              ╔════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
              ║ 1 Error                                                                                                        ║
              ╟────────────────────────────────────────────────────────────────────────────────────────────────────────────────╢
              ║ 1 Warning                                                                                                      ║
              ╚════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
              "
            `);
        });
    });

    describe("when passed one file not found message", function () {
        it("should return a string without line and column (0, 0)", function () {
            const code = [
                {
                    ...createTestResult({
                        filePath: "foo.js",
                        messages: [
                            createTestMessage({
                                fatal: true,
                                message: "Couldn't find foo.js.",
                                line: 0,
                                column: 0
                            })
                        ]
                    }),
                    errorCount: 1,
                    warningCount: 0
                }
            ];

            const result = formatter(code as TextlintResult[], { color: false });

            expect(result).toMatchInlineSnapshot(`
              "
              foo.js

              ║ Line     │ Column   │ Type     │ Message                                                │ Rule ID              ║
              ╟──────────┼──────────┼──────────┼────────────────────────────────────────────────────────┼──────────────────────╢
              ║ 0        │ 0        │ error    │ Couldn't find foo.js.                                  │                      ║

              ╔════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
              ║ 1 Error                                                                                                        ║
              ╚════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
              "
            `);
        });
    });
});
