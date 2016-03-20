// LICENSE : MIT
"use strict";
import assert from "assert";
export function testInvalid(textlint, text, ext, errors) {
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
    let errorLength = errors.length;
    return textlint.lintText(text, ext).then(lintResult => {
        assert.strictEqual(lintResult.messages.length, errorLength, `invalid: should have ${errorLength} errors but had ${lintResult.messages.length}:
===Text===:
${text}

==Result==:
${JSON.stringify(lintResult, null, 4)}`);
        errors.forEach((error, index) => {
            let { ruleId, message, line, column } = error;
            let resultMessageObject = lintResult.messages[index];
            if (ruleId !== undefined) {
                let resultRuleId = resultMessageObject.ruleId;
                assert.strictEqual(resultRuleId, ruleId, `"ruleId should be "${ruleId}"`);
            }
            if (message !== undefined) {
                let resultMessage = resultMessageObject.message;
                assert.strictEqual(resultMessage, message, `"message should be "${message}"`);
            }
            if (line !== undefined) {
                let resultLine = resultMessageObject.line;
                assert.strictEqual(resultLine, line, `line should be ${line}`);
            }
            if (column !== undefined) {
                let resultColumn = resultMessageObject.column;
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
