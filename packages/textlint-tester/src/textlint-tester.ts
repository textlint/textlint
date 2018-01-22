// LICENSE : MIT
"use strict";
import * as assert from "assert";
import { testInvalid, testValid } from "./test-util";
import { TextLintCore } from "textlint";
import { TextlintFixResult, TextlintPluginCreator, TextlintRuleCreator } from "@textlint/kernel";

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

export type TestTarget = {
    plugins: { pluginId: string; plugin: TextlintPluginCreator }[];
    rules: { ruleId: string; rule: TextlintRuleCreator }[];
};

function isTestTarget(arg: any) {
    return arg.plugins !== undefined;
}

export type TesterValid =
    | string
    | {
          text?: string;
          ext?: string;
          inputPath?: string;
          options?: any;
          pluginOptions?: any;
      };

export type TesterInvalid = {
    text?: string;
    output?: string;
    ext?: string;
    inputPath?: string;
    options?: any;
    pluginOptions?: any;
    errors: {
        ruleId?: string;
        index?: number;
        line?: number;
        column?: number;
        message?: string;
        [index: string]: any;
    }[];
};

export class TextLintTester {
    constructor() {
        if (typeof coreFlags === "object") {
            coreFlags.runningTester = true;
        }
    }

    testValidPattern(name: string, param: TextlintRuleCreator | TestTarget, valid: TesterValid) {
        const text = typeof valid === "object" ? valid.text : valid;
        const inputPath = typeof valid === "object" ? valid.inputPath : undefined;
        const options = (typeof valid === "object" && valid.options) || {};
        const ext = typeof valid === "object" && valid.ext !== undefined ? valid.ext : ".md";
        const textlint = new TextLintCore();
        const pluginOptions = (typeof valid === "object" && valid.pluginOptions) || {};
        if (isTestTarget(param)) {
            (param as TestTarget).rules.forEach(rule => {
                const ruleName = rule.ruleId;
                const ruleObject = rule.rule;
                textlint.setupRules(
                    {
                        [ruleName]: ruleObject
                    },
                    {
                        [ruleName]: options
                    }
                );
            });
            (param as TestTarget).plugins.forEach(plugin => {
                const pluginName = plugin.pluginId;
                const pluginObject = plugin.plugin;
                textlint.setupPlugins(
                    {
                        [pluginName]: pluginObject
                    },
                    {
                        [pluginName]: pluginOptions
                    }
                );
            });
        } else {
            textlint.setupRules(
                {
                    [name]: param
                },
                {
                    [name]: options
                }
            );
        }
        it(inputPath || text, () => {
            return testValid({ textlint, inputPath, text, ext });
        });
    }

    testInvalidPattern(name: string, param: TextlintRuleCreator | TestTarget, invalid: TesterInvalid) {
        const errors = invalid.errors;
        const inputPath = invalid.inputPath;
        const text = invalid.text;
        const options = invalid.options || {};
        const pluginOptions = (typeof invalid === "object" && invalid.pluginOptions) || {};
        const ext = invalid.ext !== undefined ? invalid.ext : ".md";
        const textlint = new TextLintCore();
        if (isTestTarget(param)) {
            (param as TestTarget).rules.forEach(rule => {
                const ruleName = rule.ruleId;
                const ruleObject = rule.rule;
                textlint.setupRules(
                    {
                        [ruleName]: ruleObject
                    },
                    {
                        [ruleName]: options
                    }
                );
            });
            (param as TestTarget).plugins.forEach(plugin => {
                const pluginName = plugin.pluginId;
                const pluginObject = plugin.plugin;
                textlint.setupPlugins(
                    {
                        [pluginName]: pluginObject
                    },
                    {
                        [pluginName]: pluginOptions
                    }
                );
            });
        } else {
            textlint.setupRules(
                {
                    [name]: param
                },
                {
                    [name]: options
                }
            );
        }
        it(inputPath || text, () => {
            return testInvalid({ textlint, inputPath, text, ext, errors });
        });
        // --fix
        if (invalid.hasOwnProperty("output")) {
            it(`Fixer: ${inputPath || text}`, () => {
                if (isTestTarget(param)) {
                    (param as TestTarget).rules.forEach(rule => {
                        assertHasFixer(rule.rule, rule.ruleId);
                    });
                } else {
                    assertHasFixer(param, name);
                }
                let promise: Promise<TextlintFixResult>;
                if (inputPath !== undefined) {
                    promise = textlint.fixFile(inputPath);
                } else if (text !== undefined) {
                    promise = textlint.fixText(text, ext);
                } else {
                    throw new Error("Should set `text` or `inputPath`");
                }
                return promise.then(result => {
                    const output = invalid.output;
                    assert.strictEqual(result.output, output);
                });
            });
        }
    }

    /**
     * run test for textlint rule.
     * @param {string} name name is name of the test or rule
     * @param {TextlintRuleCreator|TestTarget} param param is TextlintRuleCreator or TestTarget
     * @param {string[]|object[]} [valid]
     * @param {object[]} [invalid]
     */
    run(
        name: string,
        param: TextlintRuleCreator | TestTarget,
        {
            valid = [],
            invalid = []
        }: {
            valid?: TesterValid[];
            invalid?: TesterInvalid[];
        }
    ) {
        describe(name, () => {
            invalid.forEach(state => {
                this.testInvalidPattern(name, param, state);
            });
            valid.forEach(state => {
                this.testValidPattern(name, param, state);
            });
        });
    }
}
