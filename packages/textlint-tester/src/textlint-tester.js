// LICENSE : MIT
"use strict";
import assert from "assert";
import { testValid, testInvalid } from "./test-util";
import { TextLintCore } from "textlint";
import { coreFlags } from "@textlint/feature-flag";
/* eslint-disable no-invalid-this */
const describe =
    typeof global.describe === "function"
        ? global.describe
        : function(text, method) {
              return method.apply(this);
          };

const it =
    typeof global.it === "function"
        ? global.it
        : function(text, method) {
              return method.apply(this);
          };

/* eslint-enable no-invalid-this */
/**
 * get fixer function from ruleCreator
 * if not found, throw error
 * @param {Function|Object} ruleCreator
 * @param {string} ruleName
 */
function assertHasFixer(ruleCreator, ruleName) {
    if (typeof ruleCreator.fixer === "function") {
        return;
    }
    if (typeof ruleCreator === "function") {
        return;
    }
    throw new Error(`Not found \`fixer\` function in the ruleCreator: ${ruleName}`);
}

export default class TextLintTester {
    constructor() {
        if (typeof coreFlags === "object") {
            coreFlags.runningTester = true;
        }
    }

    testValidPattern(ruleName, rule, valid) {
        const inputPath = typeof valid === "object" ? valid.inputPath : undefined;
        const text = valid.text !== undefined ? valid.text : valid;
        const options = valid.options || {};
        const ext = valid.ext !== undefined ? valid.ext : ".md";
        const textlint = new TextLintCore();
        textlint.setupRules(
            {
                [ruleName]: rule
            },
            {
                [ruleName]: options
            }
        );
        it(inputPath || text, () => {
            return testValid({ textlint, inputPath, text, ext });
        });
    }

    testInvalidPattern(ruleName, rule, invalid) {
        const errors = invalid.errors;
        const inputPath = invalid.inputPath;
        const text = invalid.text;
        const options = invalid.options || {};
        const ext = invalid.ext !== undefined ? invalid.ext : ".md";
        const textlint = new TextLintCore();
        textlint.setupRules(
            {
                [ruleName]: rule
            },
            {
                [ruleName]: options
            }
        );
        it(inputPath || text, () => {
            return testInvalid({ textlint, inputPath, text, ext, errors });
        });
        // --fix
        if (invalid.hasOwnProperty("output")) {
            it(`Fixer: ${inputPath || text}`, () => {
                assertHasFixer(rule, ruleName);
                const promise = inputPath !== undefined ? textlint.fixFile(inputPath) : textlint.fixText(text, ext);
                return promise.then(result => {
                    const output = invalid.output;
                    assert.strictEqual(result.output, output);
                });
            });
        }
    }

    /**
     * run test for textlint rule.
     * @param {string} ruleName ruleName is name of thee rule
     * @param {Function|Object} rule rule is the function of rule
     * @param {string[]|object[]} [valid]
     * @param {object[]} [invalid]
     */
    run(ruleName, rule, { valid = [], invalid = [] }) {
        describe(ruleName, () => {
            invalid.forEach(state => {
                this.testInvalidPattern(ruleName, rule, state);
            });
            valid.forEach(state => {
                this.testValidPattern(ruleName, rule, state);
            });
        });
    }
}
