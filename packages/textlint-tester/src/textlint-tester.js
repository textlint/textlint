// LICENSE : MIT
"use strict";
import ava from "ava";
// FIX: to be fix
import TextLintCore from "textlint/lib/textlint-core";
import jsdiff from "diff"
require("colors");
function diffOutput(one, other) {
    var results = "";
    var diff = jsdiff.diffChars(one, other);
    diff.forEach(function (part) {
        // green for additions, red for deletions
        // grey for common parts
        var color = part.added ? 'green' :
                    part.removed ? 'red' : 'grey';
        results += part.value[color];
    });
    return results;
}
export default class TextLintTester {

    testValidPattern(ruleName, rule, valid) {
        let text = valid.text || valid;
        ava(`${ruleName} - "${text}"`, t => {
            let options = valid.options || {};
            t.is(typeof text, "string", "valid should has string of text.");
            var textlint = new TextLintCore();
            textlint.setupRules({
                ruleName: rule
            }, {
                ruleName: options
            });
            var results = textlint.lintMarkdown(text);
            t.is(results.messages.length, 0, `should have no errors but had Error results: ${JSON.stringify(results, null, 4)}`);
            t.end();
        });
    }

    testInvalidPattern(ruleName, rule, invalid) {
        let text = invalid.text;
        ava(`${ruleName} - "${text}"`, t => {
            let options = invalid.options || {};
            let errors = invalid.errors;
            t.is(typeof text, "string", `invalid : [{ text: "string" } should be string`);
            t.ok(Array.isArray(errors), `invalid : [{ errors: [{...}] } should be array`);
            let errorLength = errors.length;
            var textlint = new TextLintCore();
            textlint.setupRules({
                ruleName: rule
            }, {
                ruleName: options
            });
            var lintResult = textlint.lintMarkdown(text);
            t.is(lintResult.messages.length, errorLength, `Should have ${errorLength} errors but had : ${JSON.stringify(lintResult, null, 4)}`);
            errors.forEach((error, index) => {
                let { ruleId, message, line, column } = error;
                let resultMessageObject = lintResult.messages[index];
                if (ruleId) {
                    let resultRuleId = resultMessageObject.ruleId;
                    t.is(resultRuleId, ruleId, `"Error ruleId should be ${ruleId}`);
                }
                if (message) {
                    let resultMessage = resultMessageObject.message;
                    t.is(resultMessage, message, `"Error message should be ${diffOutput(resultMessage, message)}`);
                }
                if (line) {
                    let resultLine = resultMessageObject.line;
                    t.is(resultLine, line, `"Error line should be ${line}`);
                }
                if (column) {
                    let resultColumn = resultMessageObject.column;
                    t.is(resultColumn, column, `"Error column should be ${column}`);
                }
            });
            t.end();
        });
    }

    run(ruleName, rule, {valid=[], invalid=[]}) {
        valid.forEach(state => {
            this.testValidPattern(ruleName, rule, state);
        });
        invalid.forEach(state => {
            this.testInvalidPattern(ruleName, rule, state);
        });
    }
}