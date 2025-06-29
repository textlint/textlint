/**
 * @fileoverview Tests for stylish formatter.
 */

import { describe, it, expect } from "vitest";
import stylish from "../../src/formatters/stylish.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatter = (code: any) => {
    return stylish(code, { color: false });
};

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
            const code = [
                {
                    filePath: "foo.js",
                    messages: [
                        {
                            message: "Unexpected foo.",
                            severity: 1,
                            line: 5,
                            column: 10,
                            ruleId: "foo"
                        }
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
            const code = [
                {
                    filePath: "foo.js",
                    messages: [
                        {
                            message: "Unexpected foo.",
                            severity: 3,
                            line: 5,
                            column: 10,
                            ruleId: "foo"
                        }
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
