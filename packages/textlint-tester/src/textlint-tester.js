// LICENSE : MIT
"use strict";
import {testValid, testInvalid} from "./test-util";
import {TextLintCore} from "textlint";
const describe = (typeof global.describe === "function") ? global.describe : function (text, method) {
    return method.apply(this);
};

const it = (typeof global.it === "function") ? global.it : function (text, method) {
    return method.apply(this);
};

export default class TextLintTester {
    testValidPattern(ruleName, rule, valid) {
        let text = valid.text || valid;
        let options = valid.options || {};
        var textlint = new TextLintCore();
        textlint.setupRules({
            [ruleName]: rule
        }, {
            [ruleName]: options
        });
        it(text, ()=> {
            return testValid(textlint, text);
        });
    }

    testInvalidPattern(ruleName, rule, invalid) {
        let text = invalid.text;
        let options = invalid.options || {};
        let errors = invalid.errors;
        var textlint = new TextLintCore();
        textlint.setupRules({
            [ruleName]: rule
        }, {
            [ruleName]: options
        });
        it(text, ()=> {
            return testInvalid(textlint, text, errors);
        });
    }

    testState(ruleName, rule, valid, invalid) {
        let validListNoOptions = valid.filter(state => {
            return state.options === undefined;
        });
        let invalidListNoOptions = invalid.filter(state => {
            return state.options === undefined;
        });
        if (validListNoOptions.length === 0 || invalidListNoOptions.length === 0) {
            return;
        }
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
            invalid.forEach(state => {
                this.testInvalidPattern(ruleName, rule, state);
            });
            valid.forEach(state => {
                this.testValidPattern(ruleName, rule, state);
            });
            this.testState(ruleName, rule, valid, invalid);
        });
    }
}