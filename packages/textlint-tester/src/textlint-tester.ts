// LICENSE : MIT
"use strict";
import * as assert from "assert";
import { testInvalid, testValid } from "./test-util";
import { TextLintCore } from "textlint";
import { TextlintRuleCreator } from "@textlint/kernel";

const { coreFlags } = require("@textlint/feature-flag");

/* eslint-disable no-invalid-this */
const globalObject: any = global;
const describe =
    typeof globalObject.describe === "function"
        ? globalObject.describe
        : function(this: any, _text: string, method: () => any) {
              return method.apply(this);
          };

const it =
    typeof globalObject.it === "function"
        ? globalObject.it
        : function(this: any, _text: string, method: () => any) {
              return method.apply(this);
          };

/* eslint-enable no-invalid-this */
/**
 * get fixer function from ruleCreator
 * if not found, throw error
 * @param {Function|Object} ruleCreator
 * @param {string} ruleName
 */
function assertHasFixer(ruleCreator: any, ruleName: string): any {
    if (typeof ruleCreator.fixer === "function") {
        return;
    }
    if (typeof ruleCreator === "function") {
        return;
    }
    throw new Error(`Not found \`fixer\` function in the ruleCreator: ${ruleName}`);
}

export type TesterValid =
    | string
    | {
          text: string;
          ext?: string;
          inputPath?: string;
          options?: any;
      };
export type TesterInvalidValid = {
    text: string;
    output?: string;
    ext?: string;
    inputPath?: string;
    options?: any;
    errors: { index?: number; line?: number; column?: number; message?: string }[];
};

export class TextLintTester {
    constructor() {
        if (typeof coreFlags === "object") {
            coreFlags.runningTester = true;
        }
    }

    testValidPattern(ruleName: string, rule: TextlintRuleCreator, valid: TesterValid) {
        const text = typeof valid === "object" ? valid.text : valid;
        const inputPath = typeof valid === "object" ? valid.inputPath : undefined;
        const options = (typeof valid === "object" && valid.options) || {};
        const ext = typeof valid === "object" && valid.ext !== undefined ? valid.ext : ".md";
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

    testInvalidPattern(ruleName: string, rule: TextlintRuleCreator, invalid: TesterInvalidValid) {
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
    run(ruleName: string, rule: TextlintRuleCreator, { valid = [], invalid = [] }) {
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
