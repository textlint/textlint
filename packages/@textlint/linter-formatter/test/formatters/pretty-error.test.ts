// LICENSE : MIT

import prettyError from "../../src/formatters/pretty-error.js";

import { describe, it } from "vitest";

import * as assert from "node:assert";
import type { TextlintMessage } from "@textlint/types";
import * as path from "node:path";

// Helper to create test message with minimal required properties
function createTestMessage(
    overrides: Partial<TextlintMessage> & { source?: string; fix?: { range: number[]; text: string } } = {}
): TextlintMessage & { source?: string; fix?: { range: number[]; text: string } } {
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
describe("pretty-error", function () {
    describe("when first line", function () {
        it("should start 0 line", function () {
            const fooFile = path.join(__dirname, "../fixtures", "foo.md");
            const code = [
                {
                    filePath: fooFile,
                    messages: [
                        createTestMessage({
                            message: "Unexpected foo.",
                            severity: 2,
                            line: 1,
                            column: 1,
                            ruleId: "foo",
                            source: "foo"
                        })
                    ]
                }
            ];
            const output = prettyError(code, {
                color: false
            });
            assert.equal(
                output,
                `foo: Unexpected foo.
${fooFile}:1:1
       v
    0. 
    1. 1st line
    2. 2nd line
       ^

\u2716 1 problem (1 error)
`
            );
        });
    });

    describe("when contain fixable", function () {
        it("should return output", function () {
            const fooFile = path.join(__dirname, "../fixtures", "foo.md");
            const barFile = path.join(__dirname, "../fixtures", "bar.md");
            const code = [
                {
                    filePath: fooFile,
                    messages: [
                        createTestMessage({
                            message: "Unexpected foo.",
                            severity: 2,
                            line: 5,
                            column: 10,
                            ruleId: "foo",
                            fix: {
                                range: [40, 45],
                                text: "fixed 1"
                            }
                        })
                    ]
                },
                {
                    filePath: barFile,
                    messages: [
                        createTestMessage({
                            message: "Unexpected bar.",
                            severity: 1,
                            line: 6,
                            column: 1,
                            ruleId: "bar",
                            fix: {
                                range: [50, 55],
                                text: "fixed 2"
                            }
                        })
                    ]
                }
            ];
            const output = prettyError(code, {
                color: false
            });
            assert.equal(
                output,
                `✓ foo: Unexpected foo.
${fooFile}:5:10
                v
    4. 4th line
    5. 5th line foo
    6. 6th line
                ^

✓ bar: Unexpected bar.
${barFile}:6:1
       v
    5. 5th line foo
    6. 6th line
    7. 
       ^

\u2716 2 problems (1 error, 1 warning)
\u2713 2 fixable problems.
Try to run: $ textlint --fix [file]
`
            );
        });
    });
    describe("when last line", function () {
        it("should contain end+1 line", function () {
            const fooFile = path.join(__dirname, "../fixtures", "foo.md");
            const code = [
                {
                    filePath: fooFile,
                    messages: [
                        createTestMessage({
                            message: "Unexpected foo.",
                            severity: 2,
                            line: 6,
                            column: 1,
                            ruleId: "foo",
                            source: "foo"
                        })
                    ]
                }
            ];
            const output = prettyError(code, {
                color: false
            });
            assert.equal(
                output,
                `foo: Unexpected foo.
${fooFile}:6:1
       v
    5. 5th line foo
    6. 6th line
    7. 
       ^

\u2716 1 problem (1 error)
`
            );
        });
    });
    describe("when last line", function () {
        it("should contain end+1 line", function () {
            const fooFile = path.join(__dirname, "../fixtures", "foo.md");
            const code = [
                {
                    filePath: fooFile,
                    messages: [
                        createTestMessage({
                            message: "Unexpected foo.",
                            severity: 2,
                            line: 6,
                            column: 1,
                            ruleId: "foo",
                            source: "foo"
                        })
                    ]
                }
            ];
            const output = prettyError(code, {
                color: false
            });
            assert.equal(
                output,
                `foo: Unexpected foo.
${fooFile}:6:1
       v
    5. 5th line foo
    6. 6th line
    7. 
       ^

\u2716 1 problem (1 error)
`
            );
        });
    });
    describe("when CKJ(東アジア文字幅)", function () {
        it("should correct position ^", function () {
            const ckjFile = path.join(__dirname, "../fixtures", "ckj.md");
            const code = [
                {
                    filePath: ckjFile,
                    messages: [
                        createTestMessage({
                            message: "Unexpected foo.",
                            severity: 2,
                            line: 2,
                            column: 16,
                            ruleId: "foo",
                            fix: {
                                range: [40, 45],
                                text: "fixed 1"
                            }
                        })
                    ]
                }
            ];
            const output = prettyError(code, {
                color: false
            });
            assert.equal(
                output,
                `✓ foo: Unexpected foo.
${ckjFile}:2:16
                             v
    1. 1st line
    2. 日本語 中国語 English！
    3. 3rd line
                             ^

\u2716 1 problem (1 error)
\u2713 1 fixable problem.
Try to run: $ textlint --fix [file]
`
            );
        });
    });
    describe("when contain info severity", function () {
        it("should return output for info level", function () {
            const fooFile = path.join(__dirname, "../fixtures", "foo.md");
            const code = [
                {
                    filePath: fooFile,
                    messages: [
                        createTestMessage({
                            message: "Unexpected foo.",
                            severity: 3,
                            line: 5,
                            column: 10,
                            ruleId: "foo",
                            source: "foo"
                        })
                    ]
                }
            ];
            const output = prettyError(code, {
                color: false
            });
            assert.equal(
                output,
                `foo: Unexpected foo.
${fooFile}:5:10
                v
    4. 4th line
    5. 5th line foo
    6. 6th line
                ^

\u2716 1 problem (1 info)
`
            );
        });
    });
    describe("getSource", function () {
        it("should show the content from getSource for a file that does not exist", function () {
            const filePath = "virtual.md";
            const results = [
                {
                    filePath,
                    messages: [createTestMessage({ message: "Found bar.", line: 2, column: 1, ruleId: "bar" })]
                }
            ];
            const output = prettyError(results, {
                color: false,
                getSource: (sourceFilePath: string) => (sourceFilePath === filePath ? "foo\nbar\nbaz" : undefined)
            });
            assert.ok(output.includes("bar: Found bar.\nvirtual.md:2:1\n"), output);
            assert.ok(output.includes("    1. foo\n    2. bar\n    3. baz\n"), output);
        });
        it("should prefer the content from getSource over the file", function () {
            const fooFile = path.join(__dirname, "../fixtures", "foo.md");
            const results = [
                {
                    filePath: fooFile,
                    messages: [createTestMessage({ message: "Found text.", line: 1, column: 1, ruleId: "rule" })]
                }
            ];
            const output = prettyError(results, {
                color: false,
                getSource: () => "in-memory text"
            });
            assert.ok(output.includes("1. in-memory text"), output);
            assert.ok(!output.includes("1st line"), output);
        });
        it("should read the file when getSource returns undefined", function () {
            const fooFile = path.join(__dirname, "../fixtures", "foo.md");
            const results = [
                {
                    filePath: fooFile,
                    messages: [createTestMessage({ message: "Found text.", line: 1, column: 1, ruleId: "rule" })]
                }
            ];
            const output = prettyError(results, {
                color: false,
                getSource: () => undefined
            });
            assert.ok(output.includes("1. 1st line"), output);
        });
        it("should not call getSource or read the file for a result without messages", function () {
            const calledFilePaths: string[] = [];
            const output = prettyError([{ filePath: "not-found.md", messages: [] }], {
                color: false,
                getSource: (filePath: string) => {
                    calledFilePaths.push(filePath);
                    return undefined;
                }
            });
            assert.equal(output, "");
            assert.deepEqual(calledFilePaths, []);
        });
    });
});
