// TODO: move to @textlint/source-code-fixer
import * as assert from "assert";
import { applyFixesToSourceCode, revertSourceCode, applyFixesToText } from "@textlint/source-code-fixer";
import { parse } from "@textlint/markdown-to-ast";
import { TextlintSourceCodeImpl } from "../../src/context/TextlintSourceCodeImpl";
import { TextlintMessage, TextlintSourceCode } from "@textlint/types";

const TEST_CODE = "var answer = 6 * 7;";
const TEST_AST = parse(TEST_CODE);
const createTextlintMessage = (
    message: Partial<TextlintMessage> & { message: string; fix?: TextlintMessage["fix"] }
): TextlintMessage => {
    return {
        // No Used
        ruleId: "test",
        severity: 1,
        index: 0,
        line: 1,
        column: 0,
        range: [0, 1],
        loc: {
            start: {
                line: 1,
                column: 0
            },
            end: {
                line: 1,
                column: 1
            }
        },
        type: "lint",
        ...message
    };
};
const INSERT_AT_END = createTextlintMessage({
    message: "End",
    fix: {
        range: [TEST_CODE.length, TEST_CODE.length],
        text: "// end"
    }
});
const INSERT_AT_START = createTextlintMessage({
    message: "Start",
    fix: {
        range: [0, 0],
        text: "// start\n"
    }
});
const INSERT_IN_MIDDLE = createTextlintMessage({
    message: "Multiply",
    fix: {
        range: [13, 13],
        text: "5 *"
    }
});
const REPLACE_ID = createTextlintMessage({
    message: "foo",
    fix: {
        range: [4, 10],
        text: "foo"
    }
});
const REPLACE_VAR = createTextlintMessage({
    message: "let",
    fix: {
        range: [0, 3],
        text: "let"
    }
});
const REPLACE_NUM = createTextlintMessage({
    message: "5",
    fix: {
        range: [13, 14],
        text: "5"
    }
});
const REMOVE_START = createTextlintMessage({
    message: "removestart",
    fix: {
        range: [0, 4],
        text: ""
    }
});
const REMOVE_MIDDLE = createTextlintMessage({
    message: "removemiddle",
    fix: {
        range: [5, 10],
        text: ""
    }
});
const REMOVE_END = createTextlintMessage({
    message: "removeend",
    fix: {
        range: [14, 18],
        text: ""
    }
});
const INSERT_BOM = createTextlintMessage({
    message: "insert-bom",
    fix: {
        range: [0, 0],
        text: "\uFEFF"
    }
});
const INSERT_BOM_WITH_TEXT = createTextlintMessage({
    message: "insert-bom",
    fix: {
        range: [0, 0],
        text: "\uFEFF// start\n"
    }
});
const REMOVE_BOM = createTextlintMessage({
    message: "remove-bom",
    fix: {
        range: [-1, 0],
        text: ""
    }
});
const REPLACE_BOM_WITH_TEXT = createTextlintMessage({
    message: "remove-bom",
    fix: {
        range: [-1, 0],
        text: "// start\n"
    }
});
const NO_FIX = createTextlintMessage({
    message: "nofix"
});
const NO_FIX1 = createTextlintMessage({
    message: "nofix1",
    line: 1,
    column: 3
});
const NO_FIX2 = createTextlintMessage({
    message: "nofix2",
    line: 1,
    column: 7
});

describe("SourceCodeFixer", function () {
    describe("applyFixes() with no BOM", function () {
        let sourceCode: TextlintSourceCode;

        beforeEach(function () {
            sourceCode = new TextlintSourceCodeImpl({ text: TEST_CODE, ast: TEST_AST, ext: ".md" });
        });
        describe("applyFixesToText", function () {
            it("should return fixed text ", function () {
                const output = applyFixesToText(sourceCode.text, [INSERT_AT_END]);
                assert.strictEqual(output, TEST_CODE + INSERT_AT_END.fix?.text);
            });
        });
        describe("Text Insertion", function () {
            it("should insert text at the end of the code", function () {
                const result = applyFixesToSourceCode(sourceCode, [INSERT_AT_END]);
                assert.strictEqual(result.output, TEST_CODE + INSERT_AT_END.fix?.text);
                assert.strictEqual(result.applyingMessages.length, 1);
                assert.strictEqual(result.remainingMessages.length, 0);
            });

            it("should insert text at the beginning of the code", function () {
                const result = applyFixesToSourceCode(sourceCode, [INSERT_AT_START]);
                assert.strictEqual(result.output, INSERT_AT_START.fix?.text + TEST_CODE);
                assert.strictEqual(result.remainingMessages.length, 0);
            });

            it("should insert text in the middle of the code", function () {
                const result = applyFixesToSourceCode(sourceCode, [INSERT_IN_MIDDLE]);
                assert.strictEqual(result.output, TEST_CODE.replace("6 *", `${INSERT_IN_MIDDLE.fix?.text}6 *`));
                assert.strictEqual(result.remainingMessages.length, 0);
            });

            it("should insert text at the beginning, middle, and end of the code", function () {
                const result = applyFixesToSourceCode(sourceCode, [INSERT_IN_MIDDLE, INSERT_AT_START, INSERT_AT_END]);
                assert.strictEqual(
                    result.output,
                    INSERT_AT_START.fix?.text +
                        TEST_CODE.replace("6 *", `${INSERT_IN_MIDDLE.fix?.text}6 *`) +
                        INSERT_AT_END.fix?.text
                );
                assert.strictEqual(result.remainingMessages.length, 0);
            });
        });

        describe("Text Replacement", function () {
            it("should replace text at the end of the code", function () {
                const result = applyFixesToSourceCode(sourceCode, [REPLACE_VAR]);
                assert.strictEqual(result.remainingMessages.length, 0);
                assert.strictEqual(result.output, TEST_CODE.replace("var", "let"));
                assert.ok(result.fixed);
            });

            it("should replace text at the beginning of the code", function () {
                const result = applyFixesToSourceCode(sourceCode, [REPLACE_ID]);
                assert.strictEqual(result.remainingMessages.length, 0);
                assert.strictEqual(result.output, TEST_CODE.replace("answer", "foo"));
                assert.ok(result.fixed);
            });

            it("should replace text in the middle of the code", function () {
                const result = applyFixesToSourceCode(sourceCode, [REPLACE_NUM]);
                assert.strictEqual(result.remainingMessages.length, 0);
                assert.strictEqual(result.output, TEST_CODE.replace("6", "5"));
                assert.ok(result.fixed);
            });

            it("should replace text at the beginning and end of the code", function () {
                const result = applyFixesToSourceCode(sourceCode, [REPLACE_ID, REPLACE_VAR, REPLACE_NUM]);
                assert.strictEqual(result.remainingMessages.length, 0);
                assert.strictEqual(result.output, "let foo = 5 * 7;");
                assert.ok(result.fixed);
            });
        });

        describe("Text Removal", function () {
            it("should remove text at the start of the code", function () {
                const result = applyFixesToSourceCode(sourceCode, [REMOVE_START]);
                assert.strictEqual(result.remainingMessages.length, 0);
                assert.strictEqual(result.output, TEST_CODE.replace("var ", ""));
                assert.ok(result.fixed);
            });

            it("should remove text in the middle of the code", function () {
                const result = applyFixesToSourceCode(sourceCode, [REMOVE_MIDDLE]);
                assert.strictEqual(result.remainingMessages.length, 0);
                assert.strictEqual(result.output, TEST_CODE.replace("answer", "a"));
                assert.ok(result.fixed);
            });

            it("should remove text towards the end of the code", function () {
                const result = applyFixesToSourceCode(sourceCode, [REMOVE_END]);
                assert.strictEqual(result.remainingMessages.length, 0);
                assert.strictEqual(result.output, TEST_CODE.replace(" * 7", ""));
                assert.ok(result.fixed);
            });

            it("should remove text at the beginning, middle, and end of the code", function () {
                const result = applyFixesToSourceCode(sourceCode, [REMOVE_END, REMOVE_START, REMOVE_MIDDLE]);
                assert.strictEqual(result.remainingMessages.length, 0);
                assert.strictEqual(result.output, "a = 6;");
                assert.ok(result.fixed);
            });
        });

        describe("Combination", function () {
            it("should replace text at the beginning, remove text in the middle, and insert text at the end", function () {
                const result = applyFixesToSourceCode(sourceCode, [INSERT_AT_END, REMOVE_END, REPLACE_VAR]);
                assert.strictEqual(result.output, "let answer = 6;// end");
                assert.ok(result.fixed);
                assert.strictEqual(result.remainingMessages.length, 0);
            });

            it("should only apply one fix when ranges overlap", function () {
                const result = applyFixesToSourceCode(sourceCode, [REMOVE_MIDDLE, REPLACE_ID]);
                assert.strictEqual(result.output, TEST_CODE.replace("answer", "a"));
                assert.strictEqual(result.remainingMessages.length, 1);
                assert.strictEqual(result.remainingMessages[0].message, "foo");
                assert.ok(result.fixed);
            });

            it("should apply all fixes when the end of one range is the same as the start of a previous range", function () {
                const result = applyFixesToSourceCode(sourceCode, [REMOVE_START, REPLACE_ID]);
                assert.strictEqual(result.output, TEST_CODE.replace("answer", "foo").replace("var ", ""));
                assert.strictEqual(result.remainingMessages.length, 0);
                assert.ok(result.fixed);
            });

            it("should only apply one fix when ranges overlap and one message has no fix", function () {
                const result = applyFixesToSourceCode(sourceCode, [REMOVE_MIDDLE, REPLACE_ID, NO_FIX]);
                assert.strictEqual(result.output, TEST_CODE.replace("answer", "a"));
                assert.strictEqual(result.remainingMessages.length, 2);
                assert.strictEqual(result.remainingMessages[0].message, "nofix");
                assert.strictEqual(result.remainingMessages[1].message, "foo");
                assert.ok(result.fixed);
            });
            it("should apply the same fix when ranges overlap regardless of order", function () {
                const result1 = applyFixesToSourceCode(sourceCode, [REMOVE_MIDDLE, REPLACE_ID]);
                const result2 = applyFixesToSourceCode(sourceCode, [REPLACE_ID, REMOVE_MIDDLE]);
                assert.strictEqual(result1.output, result2.output);
            });
        });

        describe("No Fixes", function () {
            it("should only apply one fix when ranges overlap and one message has no fix", function () {
                const result = applyFixesToSourceCode(sourceCode, [NO_FIX]);
                assert.strictEqual(result.output, TEST_CODE);
                assert.strictEqual(result.remainingMessages.length, 1);
                assert.strictEqual(result.remainingMessages[0].message, "nofix");
                assert.ok(!result.fixed);
            });

            it("should sort the no fix messages correctly", function () {
                const result = applyFixesToSourceCode(sourceCode, [REPLACE_ID, NO_FIX2, NO_FIX1]);
                assert.strictEqual(result.output, TEST_CODE.replace("answer", "foo"));
                assert.strictEqual(result.remainingMessages.length, 2);
                assert.strictEqual(result.remainingMessages[0].message, "nofix1");
                assert.strictEqual(result.remainingMessages[1].message, "nofix2");
                assert.ok(result.fixed);
            });
        });

        describe("BOM manipulations", function () {
            it("should insert BOM with an insertion of '\uFEFF' at 0", function () {
                const result = applyFixesToSourceCode(sourceCode, [INSERT_BOM]);
                assert.strictEqual(result.output, `\uFEFF${TEST_CODE}`);
                assert.ok(result.fixed);
                assert.strictEqual(result.remainingMessages.length, 0);
            });

            it("should insert BOM with an insertion of '\uFEFFfoobar' at 0", function () {
                const result = applyFixesToSourceCode(sourceCode, [INSERT_BOM_WITH_TEXT]);
                assert.strictEqual(result.output, `\uFEFF// start\n${TEST_CODE}`);
                assert.ok(result.fixed);
                assert.strictEqual(result.remainingMessages.length, 0);
            });

            it("should remove BOM with a negative range", function () {
                const result = applyFixesToSourceCode(sourceCode, [REMOVE_BOM]);
                assert.strictEqual(result.output, TEST_CODE);
                assert.ok(result.fixed);
                assert.strictEqual(result.remainingMessages.length, 0);
            });

            it("should replace BOM with a negative range and 'foobar'", function () {
                const result = applyFixesToSourceCode(sourceCode, [REPLACE_BOM_WITH_TEXT]);
                assert.strictEqual(result.output, `// start\n${TEST_CODE}`);
                assert.ok(result.fixed);
                assert.strictEqual(result.remainingMessages.length, 0);
            });
            it("should apply the same fix when ranges overlap regardless of order", function () {
                const result1 = applyFixesToSourceCode(sourceCode, [REMOVE_MIDDLE, REPLACE_ID]);
                const result2 = applyFixesToSourceCode(sourceCode, [REPLACE_ID, REMOVE_MIDDLE]);

                assert.strictEqual(result1.output, result2.output);
            });
        });
    });

    // This section is almost same as "with no BOM".
    // Just `result.output` has BOM.
    describe("applyFixes() with BOM", function () {
        let sourceCode: TextlintSourceCode;

        beforeEach(function () {
            sourceCode = new TextlintSourceCodeImpl({ text: `\uFEFF${TEST_CODE}`, ast: TEST_AST, ext: ".md" });
        });

        describe("Text Insertion", function () {
            it("should insert text at the end of the code", function () {
                const result = applyFixesToSourceCode(sourceCode, [INSERT_AT_END]);
                assert.strictEqual(result.output, `\uFEFF${TEST_CODE}${INSERT_AT_END.fix?.text}`);
                assert.strictEqual(result.remainingMessages.length, 0);
            });

            it("should insert text at the beginning of the code", function () {
                const result = applyFixesToSourceCode(sourceCode, [INSERT_AT_START]);
                assert.strictEqual(result.output, `\uFEFF${INSERT_AT_START.fix?.text}${TEST_CODE}`);
                assert.strictEqual(result.remainingMessages.length, 0);
            });

            it("should insert text in the middle of the code", function () {
                const result = applyFixesToSourceCode(sourceCode, [INSERT_IN_MIDDLE]);
                assert.strictEqual(
                    result.output,
                    `\uFEFF${TEST_CODE.replace("6 *", `${INSERT_IN_MIDDLE.fix?.text}6 *`)}`
                );
                assert.strictEqual(result.remainingMessages.length, 0);
            });

            it("should insert text at the beginning, middle, and end of the code", function () {
                const result = applyFixesToSourceCode(sourceCode, [INSERT_IN_MIDDLE, INSERT_AT_START, INSERT_AT_END]);
                assert.strictEqual(
                    result.output,
                    `\uFEFF${INSERT_AT_START.fix?.text}${TEST_CODE.replace("6 *", `${INSERT_IN_MIDDLE.fix?.text}6 *`)}${
                        INSERT_AT_END.fix?.text
                    }`
                );
                assert.strictEqual(result.remainingMessages.length, 0);
            });
        });

        describe("Text Replacement", function () {
            it("should replace text at the end of the code", function () {
                const result = applyFixesToSourceCode(sourceCode, [REPLACE_VAR]);
                assert.strictEqual(result.remainingMessages.length, 0);
                assert.strictEqual(result.output, `\uFEFF${TEST_CODE.replace("var", "let")}`);
                assert.ok(result.fixed);
            });

            it("should replace text at the beginning of the code", function () {
                const result = applyFixesToSourceCode(sourceCode, [REPLACE_ID]);
                assert.strictEqual(result.remainingMessages.length, 0);
                assert.strictEqual(result.output, `\uFEFF${TEST_CODE.replace("answer", "foo")}`);
                assert.ok(result.fixed);
            });

            it("should replace text in the middle of the code", function () {
                const result = applyFixesToSourceCode(sourceCode, [REPLACE_NUM]);
                assert.strictEqual(result.remainingMessages.length, 0);
                assert.strictEqual(result.output, `\uFEFF${TEST_CODE.replace("6", "5")}`);
                assert.ok(result.fixed);
            });

            it("should replace text at the beginning and end of the code", function () {
                const result = applyFixesToSourceCode(sourceCode, [REPLACE_ID, REPLACE_VAR, REPLACE_NUM]);
                assert.strictEqual(result.remainingMessages.length, 0);
                assert.strictEqual(result.output, "\uFEFFlet foo = 5 * 7;");
                assert.ok(result.fixed);
            });
        });

        describe("Text Removal", function () {
            it("should remove text at the start of the code", function () {
                const result = applyFixesToSourceCode(sourceCode, [REMOVE_START]);
                assert.strictEqual(result.remainingMessages.length, 0);
                assert.strictEqual(result.output, `\uFEFF${TEST_CODE.replace("var ", "")}`);
                assert.ok(result.fixed);
            });

            it("should remove text in the middle of the code", function () {
                const result = applyFixesToSourceCode(sourceCode, [REMOVE_MIDDLE]);
                assert.strictEqual(result.remainingMessages.length, 0);
                assert.strictEqual(result.output, `\uFEFF${TEST_CODE.replace("answer", "a")}`);
                assert.ok(result.fixed);
            });

            it("should remove text towards the end of the code", function () {
                const result = applyFixesToSourceCode(sourceCode, [REMOVE_END]);
                assert.strictEqual(result.remainingMessages.length, 0);
                assert.strictEqual(result.output, `\uFEFF${TEST_CODE.replace(" * 7", "")}`);
                assert.ok(result.fixed);
            });

            it("should remove text at the beginning, middle, and end of the code", function () {
                const result = applyFixesToSourceCode(sourceCode, [REMOVE_END, REMOVE_START, REMOVE_MIDDLE]);
                assert.strictEqual(result.remainingMessages.length, 0);
                assert.strictEqual(result.output, "\uFEFFa = 6;");
                assert.ok(result.fixed);
            });
        });

        describe("Combination", function () {
            it("should replace text at the beginning, remove text in the middle, and insert text at the end", function () {
                const result = applyFixesToSourceCode(sourceCode, [INSERT_AT_END, REMOVE_END, REPLACE_VAR]);
                assert.strictEqual(result.output, "\uFEFFlet answer = 6;// end");
                assert.ok(result.fixed);
                assert.strictEqual(result.remainingMessages.length, 0);
            });

            it("should only apply one fix when ranges overlap", function () {
                const result = applyFixesToSourceCode(sourceCode, [REMOVE_MIDDLE, REPLACE_ID]);
                assert.strictEqual(result.output, `\uFEFF${TEST_CODE.replace("answer", "a")}`);
                assert.strictEqual(result.remainingMessages.length, 1);
                assert.strictEqual(result.remainingMessages[0].message, "foo");
                assert.ok(result.fixed);
            });

            it("should apply all fixes when the end of one range is the same as the start of a previous range", function () {
                const result = applyFixesToSourceCode(sourceCode, [REMOVE_START, REPLACE_ID]);
                assert.strictEqual(result.output, `\uFEFF${TEST_CODE.replace("answer", "foo").replace("var ", "")}`);
                assert.strictEqual(result.remainingMessages.length, 0);
                assert.ok(result.fixed);
            });

            it("should only apply one fix when ranges overlap and one message has no fix", function () {
                const result = applyFixesToSourceCode(sourceCode, [REMOVE_MIDDLE, REPLACE_ID, NO_FIX]);
                assert.strictEqual(result.output, `\uFEFF${TEST_CODE.replace("answer", "a")}`);
                assert.strictEqual(result.remainingMessages.length, 2);
                assert.strictEqual(result.remainingMessages[0].message, "nofix");
                assert.strictEqual(result.remainingMessages[1].message, "foo");
                assert.ok(result.fixed);
            });
        });

        describe("No Fixes", function () {
            it("should only apply one fix when ranges overlap and one message has no fix", function () {
                const result = applyFixesToSourceCode(sourceCode, [NO_FIX]);
                assert.strictEqual(result.output, `\uFEFF${TEST_CODE}`);
                assert.strictEqual(result.remainingMessages.length, 1);
                assert.strictEqual(result.remainingMessages[0].message, "nofix");
                assert.ok(!result.fixed);
            });
        });

        describe("BOM manipulations", function () {
            it("should insert BOM with an insertion of '\uFEFF' at 0", function () {
                const result = applyFixesToSourceCode(sourceCode, [INSERT_BOM]);
                assert.strictEqual(result.output, `\uFEFF${TEST_CODE}`);
                assert.ok(result.fixed);
                assert.strictEqual(result.remainingMessages.length, 0);
            });

            it("should insert BOM with an insertion of '\uFEFFfoobar' at 0", function () {
                const result = applyFixesToSourceCode(sourceCode, [INSERT_BOM_WITH_TEXT]);
                assert.strictEqual(result.output, `\uFEFF// start\n${TEST_CODE}`);
                assert.ok(result.fixed);
                assert.strictEqual(result.remainingMessages.length, 0);
            });

            it("should remove BOM with a negative range", function () {
                const result = applyFixesToSourceCode(sourceCode, [REMOVE_BOM]);
                assert.strictEqual(result.output, TEST_CODE);
                assert.ok(result.fixed);
                assert.strictEqual(result.remainingMessages.length, 0);
            });

            it("should replace BOM with a negative range and 'foobar'", function () {
                const result = applyFixesToSourceCode(sourceCode, [REPLACE_BOM_WITH_TEXT]);
                assert.strictEqual(result.output, `// start\n${TEST_CODE}`);
                assert.ok(result.fixed);
                assert.strictEqual(result.remainingMessages.length, 0);
            });
        });
    });

    describe("revert apply fixes", function () {
        let sourceCode: TextlintSourceCode;

        beforeEach(function () {
            sourceCode = new TextlintSourceCodeImpl({ text: TEST_CODE, ast: TEST_AST, ext: ".md" });
        });
        it("should replace text at the beginning and end of the code", function () {
            const result = applyFixesToSourceCode(sourceCode, [REPLACE_ID, REPLACE_VAR, REPLACE_NUM]);
            assert.strictEqual(result.remainingMessages.length, 0);
            assert.strictEqual(result.output, "let foo = 5 * 7;");
            assert.ok(result.fixed);
            // revert
            const newSource = new TextlintSourceCodeImpl({
                text: result.output,
                ast: parse(result.output),
                ext: ".md"
            });
            // Sequentially apply applied message to applied output = revert
            const revertText = revertSourceCode(newSource, result.applyingMessages);
            assert.strictEqual(revertText, sourceCode.text);
        });
        it("should only apply one fix when ranges overlap and one message has no fix", function () {
            const result = applyFixesToSourceCode(sourceCode, [REMOVE_MIDDLE, REPLACE_ID, NO_FIX]);
            // revert
            const text = result.output;
            const newSource = new TextlintSourceCodeImpl({ text, ast: parse(text), ext: ".md" });
            const revertText = revertSourceCode(newSource, result.applyingMessages);
            assert.strictEqual(revertText, sourceCode.text);
        });
    });
});
