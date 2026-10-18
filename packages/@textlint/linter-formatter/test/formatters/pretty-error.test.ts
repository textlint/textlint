// LICENSE : MIT

import prettyError from "../../src/formatters/pretty-error.js";

import { describe, it } from "vitest";

import * as assert from "node:assert";
import type { TextlintMessage } from "@textlint/types";
import * as path from "node:path";
import * as fs from "node:fs";
import * as os from "node:os";

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
    describe("stdin source text", function () {
        it("formats diagnostics without reading a nonexistent filename", function () {
            const directory = fs.mkdtempSync(path.join(os.tmpdir(), "textlint-missing-stdin-"));
            try {
                const filename = path.join(directory, "missing.md");
                const output = prettyError(
                    [
                        {
                            filePath: filename,
                            messages: [createTestMessage({ ruleId: "example", message: "Problem", severity: 2 })]
                        }
                    ],
                    { color: false, sourceCode: "piped source" }
                );
                assert.match(output, /1\. piped source/);
                assert.match(output, /1 problem \(1 error\)/);
            } finally {
                fs.rmSync(directory, { recursive: true, force: true });
            }
        });

        it("does not read a nonexistent filename when there are no diagnostics", function () {
            const directory = fs.mkdtempSync(path.join(os.tmpdir(), "textlint-clean-stdin-"));
            try {
                const filename = path.join(directory, "missing.md");
                const output = prettyError([{ filePath: filename, messages: [] }], { color: false });
                assert.strictEqual(output, "");
            } finally {
                fs.rmSync(directory, { recursive: true, force: true });
            }
        });

        it("uses supplied stdin text instead of different on-disk content", function () {
            const directory = fs.mkdtempSync(path.join(os.tmpdir(), "textlint-pretty-stdin-"));
            try {
                const filename = path.join(directory, "document.md");
                fs.writeFileSync(filename, "disk content");
                const messages = [createTestMessage({ ruleId: "example", message: "Problem", severity: 2 })];
                const output = prettyError([{ filePath: filename, messages }], {
                    color: false,
                    sourceCode: "piped content"
                });
                assert.match(output, /1\. piped content/);
                assert.doesNotMatch(output, /disk content/);
                const fileOutput = prettyError([{ filePath: filename, messages }], { color: false });
                assert.match(fileOutput, /1\. disk content/);
            } finally {
                fs.rmSync(directory, { recursive: true, force: true });
            }
        });

        it("treats an explicitly empty source as present rather than reading disk", function () {
            const directory = fs.mkdtempSync(path.join(os.tmpdir(), "textlint-empty-stdin-"));
            try {
                const filename = path.join(directory, "document.md");
                fs.writeFileSync(filename, "disk content");
                const output = prettyError(
                    [{ filePath: filename, messages: [createTestMessage({ ruleId: "example", severity: 2 })] }],
                    { color: false, sourceCode: "" }
                );
                assert.doesNotMatch(output, /disk content/);
                assert.doesNotMatch(output, /undefined/);
                assert.match(output, /1 problem \(1 error\)/);
            } finally {
                fs.rmSync(directory, { recursive: true, force: true });
            }
        });
    });
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
});
