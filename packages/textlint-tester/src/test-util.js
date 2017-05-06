// LICENSE : MIT
"use strict";
const assert = require("assert");
export function testInvalid(textlint, text, ext, errors) {
    const lines = text.split(/\n/);
    assert.strictEqual(typeof text, "string", `invalid property should have text string
e.g.)
invalid : [
    {
        text: "example text",
        errors: [{
            message: "expected message"
        }]
    }
]
`);
    assert.ok(Array.isArray(errors), `invalid property should have array of expected error
e.g.)
invalid : [
    {
        text: "example text",
        errors: [{
            message: "expected message"
        }]
    }
]
            `);
    const errorLength = errors.length;
    return textlint.lintText(text, ext).then(lintResult => {
        assert.strictEqual(lintResult.messages.length, errorLength, `invalid: should have ${errorLength} errors but had ${lintResult.messages.length}:
===Text===:
${text}

==Result==:
${JSON.stringify(lintResult, null, 4)}`);
        errors.forEach((error, index) => {
            const {ruleId, message, line, column} = error;
            const resultMessageObject = lintResult.messages[index];
            // check
            assert.ok(resultMessageObject.line >= 1,
                `lint result's line number is ${resultMessageObject.line}, should be over than 1.`);
            assert.ok(resultMessageObject.line <= lines.length,
                `lint result's line number is line:${resultMessageObject.line}, but total line number of the text is ${lines.length}.
The result's line number should be less than ${lines.length}`);
            const columnText = lines[resultMessageObject.line - 1];
            assert.ok(resultMessageObject.column >= 1,
                `lint result's column number is ${resultMessageObject.column}, should be over than 1.`);
            assert.ok(resultMessageObject.column <= columnText.length + 1,
                `lint result's column number is ${resultMessageObject.column}, but the length of the text @ line:${resultMessageObject.line} is ${columnText.length + 1}.
The result's column number should be less than ${columnText.length + 1}`);
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
        });
    });
}


export function testValid(textlint, text, ext) {
    assert.strictEqual(typeof text, "string", "valid should has string of text.");
    return textlint.lintText(text, ext).then(results => {

        assert.strictEqual(results.messages.length, 0, `valid: should have no errors but had Error results:
===Text===:
${text}

==Result==:
${JSON.stringify(results, null, 4)}`);
    });
}
