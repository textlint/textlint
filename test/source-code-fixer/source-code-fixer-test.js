// LICENSE : MIT
"use strict";
import assert from "power-assert";
import SourceCodeFixer from "../../src/fixer/source-code-fixer";
import SourceCode from "../../src/core/source-code";
import {parse} from "markdown-to-ast";
const TEST_CODE = "var answer = 6 * 7;";
const TEST_AST = parse(TEST_CODE);
const INSERT_AT_END = {
    message: "End",
    fix: {
        range: [TEST_CODE.length, TEST_CODE.length],
        text: "// end"
    }
};
const INSERT_AT_START = {
    message: "Start",
    fix: {
        range: [0, 0],
        text: "// start\n"
    }
};
const INSERT_IN_MIDDLE = {
    message: "Multiply",
    fix: {
        range: [13, 13],
        text: "5 *"
    }
};
const REPLACE_ID = {
    message: "foo",
    fix: {
        range: [4, 10],
        text: "foo"
    }
};
const REPLACE_VAR = {
    message: "let",
    fix: {
        range: [0, 3],
        text: "let"
    }
};
const REPLACE_NUM = {
    message: "5",
    fix: {
        range: [13, 14],
        text: "5"
    }
};
const REMOVE_START = {
    message: "removestart",
    fix: {
        range: [0, 4],
        text: ""
    }
};
const REMOVE_MIDDLE = {
    message: "removemiddle",
    fix: {
        range: [5, 10],
        text: ""
    }
};
const REMOVE_END = {
    message: "removeend",
    fix: {
        range: [14, 18],
        text: ""
    }
};
const NO_FIX = {
    message: "nofix"
};
const INSERT_BOM = {
    message: "insert-bom",
    fix: {
        range: [0, 0],
        text: "\uFEFF"
    }
};
const INSERT_BOM_WITH_TEXT = {
    message: "insert-bom",
    fix: {
        range: [0, 0],
        text: "\uFEFF// start\n"
    }
};
const REMOVE_BOM = {
    message: "remove-bom",
    fix: {
        range: [-1, 0],
        text: ""
    }
};
const REPLACE_BOM_WITH_TEXT = {
    message: "remove-bom",
    fix: {
        range: [-1, 0],
        text: "// start\n"
    }
};
const NO_FIX1 = {
    message: "nofix1",
    line: 1,
    column: 3
};
const NO_FIX2 = {
    message: "nofix2",
    line: 1,
    column: 7
};

describe("SourceCodeFixer", function () {

    describe("applyFixes() with no BOM", function () {

        var sourceCode;

        beforeEach(function () {
            sourceCode = new SourceCode({
                text: TEST_CODE,
                ast: TEST_AST,
                ext: ".md"
            });
        });

        describe("Text Insertion", function () {

            it("should insert text at the end of the code", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [INSERT_AT_END]);
                assert.equal(result.output, TEST_CODE + INSERT_AT_END.fix.text);
                assert.equal(result.applyingMessages.length, 1);
                assert.equal(result.remainingMessages.length, 0);
            });

            it("should insert text at the beginning of the code", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [INSERT_AT_START]);
                assert.equal(result.output, INSERT_AT_START.fix.text + TEST_CODE);
                assert.equal(result.remainingMessages.length, 0);
            });

            it("should insert text in the middle of the code", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [INSERT_IN_MIDDLE]);
                assert.equal(result.output, TEST_CODE.replace("6 *", INSERT_IN_MIDDLE.fix.text + "6 *"));
                assert.equal(result.remainingMessages.length, 0);
            });

            it("should insert text at the beginning, middle, and end of the code", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [INSERT_IN_MIDDLE, INSERT_AT_START, INSERT_AT_END]);
                assert.equal(result.output, INSERT_AT_START.fix.text + TEST_CODE.replace("6 *", INSERT_IN_MIDDLE.fix.text + "6 *") + INSERT_AT_END.fix.text);
                assert.equal(result.remainingMessages.length, 0);
            });

        });

        describe("Text Replacement", function () {

            it("should replace text at the end of the code", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [REPLACE_VAR]);
                assert.equal(result.remainingMessages.length, 0);
                assert.equal(result.output, TEST_CODE.replace("var", "let"));
                assert.ok(result.fixed);
            });

            it("should replace text at the beginning of the code", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [REPLACE_ID]);
                assert.equal(result.remainingMessages.length, 0);
                assert.equal(result.output, TEST_CODE.replace("answer", "foo"));
                assert.ok(result.fixed);
            });

            it("should replace text in the middle of the code", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [REPLACE_NUM]);
                assert.equal(result.remainingMessages.length, 0);
                assert.equal(result.output, TEST_CODE.replace("6", "5"));
                assert.ok(result.fixed);
            });

            it("should replace text at the beginning and end of the code", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [REPLACE_ID, REPLACE_VAR, REPLACE_NUM]);
                assert.equal(result.remainingMessages.length, 0);
                assert.equal(result.output, "let foo = 5 * 7;");
                assert.ok(result.fixed);
            });

        });

        describe("Text Removal", function () {

            it("should remove text at the start of the code", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [REMOVE_START]);
                assert.equal(result.remainingMessages.length, 0);
                assert.equal(result.output, TEST_CODE.replace("var ", ""));
                assert.ok(result.fixed);
            });

            it("should remove text in the middle of the code", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [REMOVE_MIDDLE]);
                assert.equal(result.remainingMessages.length, 0);
                assert.equal(result.output, TEST_CODE.replace("answer", "a"));
                assert.ok(result.fixed);
            });

            it("should remove text towards the end of the code", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [REMOVE_END]);
                assert.equal(result.remainingMessages.length, 0);
                assert.equal(result.output, TEST_CODE.replace(" * 7", ""));
                assert.ok(result.fixed);
            });

            it("should remove text at the beginning, middle, and end of the code", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [REMOVE_END, REMOVE_START, REMOVE_MIDDLE]);
                assert.equal(result.remainingMessages.length, 0);
                assert.equal(result.output, "a = 6;");
                assert.ok(result.fixed);
            });
        });

        describe("Combination", function () {

            it("should replace text at the beginning, remove text in the middle, and insert text at the end", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [INSERT_AT_END, REMOVE_END, REPLACE_VAR]);
                assert.equal(result.output, "let answer = 6;// end");
                assert.ok(result.fixed);
                assert.equal(result.remainingMessages.length, 0);
            });

            it("should only apply one fix when ranges overlap", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [REMOVE_MIDDLE, REPLACE_ID]);
                assert.equal(result.output, TEST_CODE.replace("answer", "a"));
                assert.equal(result.remainingMessages.length, 1);
                assert.equal(result.remainingMessages[0].message, "foo");
                assert.ok(result.fixed);
            });

            it("should apply one fix when the end of one range is the same as the start of a previous range overlap", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [REMOVE_START, REPLACE_ID]);
                assert.equal(result.output, TEST_CODE.replace("answer", "foo"));
                assert.equal(result.remainingMessages.length, 1);
                assert.equal(result.remainingMessages[0].message, "removestart");
                assert.ok(result.fixed);
            });

            it("should only apply one fix when ranges overlap and one message has no fix", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [REMOVE_MIDDLE, REPLACE_ID, NO_FIX]);
                assert.equal(result.output, TEST_CODE.replace("answer", "a"));
                assert.equal(result.remainingMessages.length, 2);
                assert.equal(result.remainingMessages[0].message, "nofix");
                assert.equal(result.remainingMessages[1].message, "foo");
                assert.ok(result.fixed);
            });

        });

        describe("No Fixes", function () {

            it("should only apply one fix when ranges overlap and one message has no fix", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [NO_FIX]);
                assert.equal(result.output, TEST_CODE);
                assert.equal(result.remainingMessages.length, 1);
                assert.equal(result.remainingMessages[0].message, "nofix");
                assert(!result.fixed);
            });

            it("should sort the no fix messages correctly", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [REPLACE_ID, NO_FIX2, NO_FIX1]);
                assert.equal(result.output, TEST_CODE.replace("answer", "foo"));
                assert.equal(result.remainingMessages.length, 2);
                assert.equal(result.remainingMessages[0].message, "nofix1");
                assert.equal(result.remainingMessages[1].message, "nofix2");
                assert.ok(result.fixed);
            });

        });

        describe("BOM manipulations", function () {

            it("should insert BOM with an insertion of '\uFEFF' at 0", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [INSERT_BOM]);
                assert.equal(result.output, "\uFEFF" + TEST_CODE);
                assert.ok(result.fixed);
                assert.equal(result.remainingMessages.length, 0);
            });

            it("should insert BOM with an insertion of '\uFEFFfoobar' at 0", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [INSERT_BOM_WITH_TEXT]);
                assert.equal(result.output, "\uFEFF// start\n" + TEST_CODE);
                assert.ok(result.fixed);
                assert.equal(result.remainingMessages.length, 0);
            });

            it("should remove BOM with a negative range", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [REMOVE_BOM]);
                assert.equal(result.output, TEST_CODE);
                assert.ok(result.fixed);
                assert.equal(result.remainingMessages.length, 0);
            });

            it("should replace BOM with a negative range and 'foobar'", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [REPLACE_BOM_WITH_TEXT]);
                assert.equal(result.output, "// start\n" + TEST_CODE);
                assert.ok(result.fixed);
                assert.equal(result.remainingMessages.length, 0);
            });

        });

    });

    // This section is almost same as "with no BOM".
    // Just `result.output` has BOM.
    describe("applyFixes() with BOM", function () {

        var sourceCode;

        beforeEach(function () {
            sourceCode = new SourceCode({
                text: "\uFEFF" + TEST_CODE,
                ast: TEST_AST,
                ext: ".md"
            });
        });

        describe("Text Insertion", function () {

            it("should insert text at the end of the code", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [INSERT_AT_END]);
                assert.equal(result.output, "\uFEFF" + TEST_CODE + INSERT_AT_END.fix.text);
                assert.equal(result.remainingMessages.length, 0);
            });

            it("should insert text at the beginning of the code", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [INSERT_AT_START]);
                assert.equal(result.output, "\uFEFF" + INSERT_AT_START.fix.text + TEST_CODE);
                assert.equal(result.remainingMessages.length, 0);
            });

            it("should insert text in the middle of the code", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [INSERT_IN_MIDDLE]);
                assert.equal(result.output, "\uFEFF" + TEST_CODE.replace("6 *", INSERT_IN_MIDDLE.fix.text + "6 *"));
                assert.equal(result.remainingMessages.length, 0);
            });

            it("should insert text at the beginning, middle, and end of the code", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [INSERT_IN_MIDDLE, INSERT_AT_START, INSERT_AT_END]);
                assert.equal(result.output, "\uFEFF" + INSERT_AT_START.fix.text + TEST_CODE.replace("6 *", INSERT_IN_MIDDLE.fix.text + "6 *") + INSERT_AT_END.fix.text);
                assert.equal(result.remainingMessages.length, 0);
            });

        });

        describe("Text Replacement", function () {

            it("should replace text at the end of the code", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [REPLACE_VAR]);
                assert.equal(result.remainingMessages.length, 0);
                assert.equal(result.output, "\uFEFF" + TEST_CODE.replace("var", "let"));
                assert.ok(result.fixed);
            });

            it("should replace text at the beginning of the code", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [REPLACE_ID]);
                assert.equal(result.remainingMessages.length, 0);
                assert.equal(result.output, "\uFEFF" + TEST_CODE.replace("answer", "foo"));
                assert.ok(result.fixed);
            });

            it("should replace text in the middle of the code", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [REPLACE_NUM]);
                assert.equal(result.remainingMessages.length, 0);
                assert.equal(result.output, "\uFEFF" + TEST_CODE.replace("6", "5"));
                assert.ok(result.fixed);
            });

            it("should replace text at the beginning and end of the code", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [REPLACE_ID, REPLACE_VAR, REPLACE_NUM]);
                assert.equal(result.remainingMessages.length, 0);
                assert.equal(result.output, "\uFEFFlet foo = 5 * 7;");
                assert.ok(result.fixed);
            });

        });

        describe("Text Removal", function () {

            it("should remove text at the start of the code", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [REMOVE_START]);
                assert.equal(result.remainingMessages.length, 0);
                assert.equal(result.output, "\uFEFF" + TEST_CODE.replace("var ", ""));
                assert.ok(result.fixed);
            });

            it("should remove text in the middle of the code", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [REMOVE_MIDDLE]);
                assert.equal(result.remainingMessages.length, 0);
                assert.equal(result.output, "\uFEFF" + TEST_CODE.replace("answer", "a"));
                assert.ok(result.fixed);
            });

            it("should remove text towards the end of the code", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [REMOVE_END]);
                assert.equal(result.remainingMessages.length, 0);
                assert.equal(result.output, "\uFEFF" + TEST_CODE.replace(" * 7", ""));
                assert.ok(result.fixed);
            });

            it("should remove text at the beginning, middle, and end of the code", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [REMOVE_END, REMOVE_START, REMOVE_MIDDLE]);
                assert.equal(result.remainingMessages.length, 0);
                assert.equal(result.output, "\uFEFFa = 6;");
                assert.ok(result.fixed);
            });
        });

        describe("Combination", function () {

            it("should replace text at the beginning, remove text in the middle, and insert text at the end", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [INSERT_AT_END, REMOVE_END, REPLACE_VAR]);
                assert.equal(result.output, "\uFEFFlet answer = 6;// end");
                assert.ok(result.fixed);
                assert.equal(result.remainingMessages.length, 0);
            });

            it("should only apply one fix when ranges overlap", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [REMOVE_MIDDLE, REPLACE_ID]);
                assert.equal(result.output, "\uFEFF" + TEST_CODE.replace("answer", "a"));
                assert.equal(result.remainingMessages.length, 1);
                assert.equal(result.remainingMessages[0].message, "foo");
                assert.ok(result.fixed);
            });

            it("should apply one fix when the end of one range is the same as the start of a previous range overlap", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [REMOVE_START, REPLACE_ID]);
                assert.equal(result.output, "\uFEFF" + TEST_CODE.replace("answer", "foo"));
                assert.equal(result.remainingMessages.length, 1);
                assert.equal(result.remainingMessages[0].message, "removestart");
                assert.ok(result.fixed);
            });

            it("should only apply one fix when ranges overlap and one message has no fix", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [REMOVE_MIDDLE, REPLACE_ID, NO_FIX]);
                assert.equal(result.output, "\uFEFF" + TEST_CODE.replace("answer", "a"));
                assert.equal(result.remainingMessages.length, 2);
                assert.equal(result.remainingMessages[0].message, "nofix");
                assert.equal(result.remainingMessages[1].message, "foo");
                assert.ok(result.fixed);
            });

        });

        describe("No Fixes", function () {

            it("should only apply one fix when ranges overlap and one message has no fix", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [NO_FIX]);
                assert.equal(result.output, "\uFEFF" + TEST_CODE);
                assert.equal(result.remainingMessages.length, 1);
                assert.equal(result.remainingMessages[0].message, "nofix");
                assert(!result.fixed);
            });

        });

        describe("BOM manipulations", function () {

            it("should insert BOM with an insertion of '\uFEFF' at 0", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [INSERT_BOM]);
                assert.equal(result.output, "\uFEFF" + TEST_CODE);
                assert.ok(result.fixed);
                assert.equal(result.remainingMessages.length, 0);
            });

            it("should insert BOM with an insertion of '\uFEFFfoobar' at 0", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [INSERT_BOM_WITH_TEXT]);
                assert.equal(result.output, "\uFEFF// start\n" + TEST_CODE);
                assert.ok(result.fixed);
                assert.equal(result.remainingMessages.length, 0);
            });

            it("should remove BOM with a negative range", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [REMOVE_BOM]);
                assert.equal(result.output, TEST_CODE);
                assert.ok(result.fixed);
                assert.equal(result.remainingMessages.length, 0);
            });

            it("should replace BOM with a negative range and 'foobar'", function () {
                var result = SourceCodeFixer.applyFixes(sourceCode, [REPLACE_BOM_WITH_TEXT]);
                assert.equal(result.output, "// start\n" + TEST_CODE);
                assert.ok(result.fixed);
                assert.equal(result.remainingMessages.length, 0);
            });

        });

    });

    describe("revert apply fixes", function () {

        var sourceCode;

        beforeEach(function () {
            sourceCode = new SourceCode({
                text: TEST_CODE,
                ast: TEST_AST,
                ext: ".md"
            });
        });
        it("should replace text at the beginning and end of the code", function () {
            var result = SourceCodeFixer.applyFixes(sourceCode, [REPLACE_ID, REPLACE_VAR, REPLACE_NUM]);
            assert.equal(result.remainingMessages.length, 0);
            assert.equal(result.output, "let foo = 5 * 7;");
            assert.ok(result.fixed);
            // revert
            var newSource = new SourceCode({
                text: result.output,
                ast: parse(result.output),
                ext: ".md"
            });
            // Sequentially apply applied message to applied output = revert
            const revertText = SourceCodeFixer.sequentiallyApplyFixes(newSource, result.applyingMessages);
            assert.equal(revertText, sourceCode.text);
        });
        it("should only apply one fix when ranges overlap and one message has no fix", function () {
            const result = SourceCodeFixer.applyFixes(sourceCode, [REMOVE_MIDDLE, REPLACE_ID, NO_FIX]);
            // revert
            const text = result.output;
            const newSource = new SourceCode({
                text: text,
                ast: parse(text),
                ext: ".md"
            });
            const revertText = SourceCodeFixer.sequentiallyApplyFixes(newSource, result.applyingMessages);
            assert.equal(revertText, sourceCode.text);
        });
    });
});
