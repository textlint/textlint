// LICENSE : MIT
"use strict";
import assert from "assert";
import {testValid, testInvalid} from "./test-util";
import {TextLintCore, _logger} from "textlint";
const describe = (typeof global.describe === "function") ? global.describe : function (text, method) {
    return method.apply(this);
};

const it = (typeof global.it === "function") ? global.it : function (text, method) {
    return method.apply(this);
};

/**
 * get fixer function from ruleCreator
 * if not found, throw error
 * @param {Function|Object} ruleCreator
 * @param {string} ruleName
 * @returns {Function} fixer function
 */
function assertHasFixer(ruleCreator, ruleName) {
    if (typeof ruleCreator.fixer === "function") {
        return;
    }
    if (typeof ruleCreator === "function") {
        return;
    }
    throw new Error("Not found `fixer` function in the ruleCreator: " + ruleName);
}
export default class TextLintTester {
    constructor() {
        if (_logger !== undefined) {
            _logger.setRunningTest(true);
        }
    }

    testValidPattern(ruleName, rule, valid) {
        let text = valid.text || valid;
        let options = valid.options || {};
        let ext = valid.ext || '.md';
        var textlint = new TextLintCore();
        textlint.setupRules({
            [ruleName]: rule
        }, {
            [ruleName]: options
        });
        it(text, ()=> {
            return testValid(textlint, text, ext);
        });
    }

    testInvalidPattern(ruleName, rule, invalid) {
        let text = invalid.text;
        let options = invalid.options || {};
        let errors = invalid.errors;
        let ext = invalid.ext || '.md';
        var textlint = new TextLintCore();
        textlint.setupRules({
            [ruleName]: rule
        }, {
            [ruleName]: options
        });
        it(text, ()=> {
            return testInvalid(textlint, text, ext, errors);
        });
        // --fix
        if (invalid.hasOwnProperty("output")) {
            it(`Fixer: ${text}`, ()=> {
                assertHasFixer(rule, ruleName);
                return textlint.fixText(text, ext).then(result => {
                    const output = invalid.output;
                    assert.strictEqual(result.output, output);
                });
            });
        }
    }

    /**
     * run test for textlint rule.
     * @param {string} ruleName ruleName is name of thee rule
     * @param {Function} rule rule is the function of rule
     * @param {string[]|object[]} [valid]
     * @param {object[]} [invalid]
     */
    run(ruleName, rule, {valid=[], invalid=[]}) {
        describe(ruleName, ()=> {
            invalid.forEach(state => {
                this.testInvalidPattern(ruleName, rule, state);
            });
            valid.forEach(state => {
                this.testValidPattern(ruleName, rule, state);
            });
        });
    }
}
