// LICENSE : MIT
"use strict";
const assert = require("assert");
const fs = require("fs");

/**
 *
 * @param {string} [text]
 * @param {string} [inputPath]
 * @returns {string}
 */
function getTestText({ text, inputPath }) {
    if (text !== undefined) {
        return text;
    }
    if (inputPath === undefined) {
        throw new Error("should be defined { text } or { inputPath }");
    }
    return fs.readFileSync(inputPath, "utf-8");
}

/**
 * @param {TextLintCore} textlint
 * @param {string} [text]
 * @param {string} [ext]
 * @param {string} [inputPath]
 * @param {*[]} errors
 */
export function testInvalid({ textlint, inputPath, text, ext, errors }) {
    const lines = getTestText({ text, inputPath }).split(/\n/);
    assert.strictEqual(
        typeof (inputPath || text),
        "string",
        `invalid property should have text string
e.g.)
invalid : [
    {
        text: "example text",
        errors: [{
            message: "expected message"
        }]
    }
]
`
    );
    assert.ok(
        Array.isArray(errors),
        `invalid property should have array of expected error
e.g.)
invalid : [
    {
        text: "example text",
        errors: [{
            message: "expected message"
        }]
    }
]
            `
    );
    const errorLength = errors.length;
    const promise = inputPath !== undefined ? textlint.lintFile(inputPath) : textlint.lintText(text, ext);
    return promise.then(lintResult => {
        assert.strictEqual(
            lintResult.messages.length,
            errorLength,
            `invalid: should have ${errorLength} errors but had ${lintResult.messages.length}:
===Text===:
${text}

==Result==:
${JSON.stringify(lintResult, null, 4)}`
        );
        errors.forEach((error, errorIndex) => {
            const { ruleId, message, line, column, index } = error;
            const resultMessageObject = lintResult.messages[errorIndex];
            // check
            assert.ok(
                resultMessageObject.line >= 1,
                `lint result's line number is ${resultMessageObject.line}, should be over than 1.`
            );
            assert.ok(
                resultMessageObject.line <= lines.length,
                `lint result's line number is line:${resultMessageObject.line}, but total line number of the text is ${lines.length}.
The result's line number should be less than ${lines.length}`
            );
            const columnText = lines[resultMessageObject.line - 1];
            assert.ok(
                resultMessageObject.column >= 1,
                `lint result's column number is ${resultMessageObject.column}, should be over than 1.`
            );
            assert.ok(
                resultMessageObject.column <= columnText.length + 1,
                `lint result's column number is ${resultMessageObject.column},` +
                    `but the length of the text @ line:${resultMessageObject.line} is ${columnText.length + 1}.
The result's column number should be less than ${columnText.length + 1}`
            );
            if (ruleId !== undefined) {
                const resultRuleId = resultMessageObject.ruleId;
                assert.strictEqual(resultRuleId, ruleId, `"ruleId should be "${ruleId}"`);
            }
            if (message !== undefined) {
                const resultMessage = resultMessageObject.message;
                assert.strictEqual(resultMessage, message, `"message should be "${message}"`);
            }
            if (line !== undefined) {
                const resultLine = resultMessageObject.line;
                assert.strictEqual(resultLine, line, `line should be ${line}`);
            }
            if (column !== undefined) {
                const resultColumn = resultMessageObject.column;
                assert.strictEqual(resultColumn, column, `"column should be ${column}`);
            }
            if (index !== undefined) {
                const resultIndex = resultMessageObject.index;
                assert.strictEqual(resultIndex, index, `"index should be ${index}`);
            }
        });
    });
}

/**
 * @param {TextLintCore} textlint
 * @param {string} [inputPath]
 * @param {string} [text]
 * @param {string} [ext]
 */
export function testValid({ textlint, inputPath, text, ext }) {
    assert.strictEqual(typeof (inputPath || text), "string", "valid should has string of text.");
    const promise = inputPath !== undefined ? textlint.lintFile(inputPath) : textlint.lintText(text, ext);
    return promise.then(results => {
        assert.strictEqual(
            results.messages.length,
            0,
            `valid: should have no errors but had Error results:
===Text===:
${text}

==Result==:
${JSON.stringify(results, null, 4)}`
        );
    });
}
