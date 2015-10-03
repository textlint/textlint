// LICENSE : MIT
"use strict";
// FIX: to be fix
import TextLintCore from "textlint/lib/textlint-core";
import assert from "assert";
const describe = (typeof global.describe === "function") ? global.describe : function (text, method) {
    return method.apply(this);
};

const it = (typeof global.it === "function") ? global.it : function (text, method) {
    return method.apply(this);
};
export default class TextLintTester {
    testValidPattern(ruleName, rule, valid) {
        let text = valid.text || valid;
        it(text, ()=> {
            let options = valid.options || {};
            assert.strictEqual(typeof text, "string", "valid should has string of text.");
            var textlint = new TextLintCore();
            textlint.setupRules({
                [ruleName]: rule
            }, {
                [ruleName]: options
            });
            var results = textlint.lintMarkdown(text);
            assert.strictEqual(results.messages.length, 0, `should have no errors but had Error results: ${JSON.stringify(results, null, 4)}`);
        });
    }

    testInvalidPattern(ruleName, rule, invalid) {
        let text = invalid.text;
        let options = invalid.options || {};
        let errors = invalid.errors;
        it(text, ()=> {
            assert.strictEqual(typeof text, "string", `invalid : [{ text: "string" } should be string`);
            assert.ok(Array.isArray(errors), `invalid : [{ errors: [{...}] } should be array`);
            let errorLength = errors.length;
            var textlint = new TextLintCore();
            textlint.setupRules({
                [ruleName]: rule
            }, {
                [ruleName]: options
            });
            var lintResult = textlint.lintMarkdown(text);
            assert.strictEqual(lintResult.messages.length, errorLength, `should have ${errorLength} errors but had ${lintResult.messages.length}:
${JSON.stringify(lintResult, null, 4)}`);
            errors.forEach((error, index) => {
                let { ruleId, message, line, column } = error;
                let resultMessageObject = lintResult.messages[index];
                if (ruleId) {
                    let resultRuleId = resultMessageObject.ruleId;
                    assert.strictEqual(resultRuleId, ruleId, `"ruleId should be "${ruleId}"`);
                }
                if (message) {
                    let resultMessage = resultMessageObject.message;
                    assert.strictEqual(resultMessage, message, `"message should be "${message}"`);
                }
                if (line) {
                    let resultLine = resultMessageObject.line;
                    assert.strictEqual(resultLine, line, `line should be ${line}`);
                }
                if (column) {
                    let resultColumn = resultMessageObject.column;
                    assert.strictEqual(resultColumn, column, `"column should be ${column}`);
                }
            });
        });
    }

    /**
     * run test for textlint rule.
     * @param {string} ruleName ruleName is name of thee rule
     * @param {Function} rule rule is the function of rule
     * @param {string[]|object[]} valid
     * @param {object[]} invalid
     */
    run(ruleName, rule, {valid=[], invalid=[]}) {
        describe(ruleName, ()=> {
            valid.forEach(state => {
                this.testValidPattern(ruleName, rule, state);
            });
            invalid.forEach(state => {
                this.testInvalidPattern(ruleName, rule, state);
            });
        });
    }
}