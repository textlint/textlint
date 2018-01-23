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

function assertTestConfig(testConfig: TestConfig): any {
    assert.notEqual(testConfig, null, "TestConfig is null");
    assert.notEqual(
        Object.keys(testConfig).length === 0 && testConfig.constructor === Object,
        true,
        "TestConfig is empty"
    );
    assert(Array.isArray(testConfig.rules), "TestConfig.rules should be an array");
    assert.notEqual(testConfig.rules.length, 0, "TestConfig.rules should have at least one rule");
    testConfig.rules.forEach(rule => {
        assert(rule.hasOwnProperty("ruleId"), "ruleId property not found");
        assert(rule.hasOwnProperty("rule"), "rule property not found");
    });
    if (typeof testConfig.plugins !== "undefined") {
        assert(Array.isArray(testConfig.plugins), "TestConfig.plugins should be an array");
        testConfig.plugins.forEach(plugin => {
            assert(plugin.hasOwnProperty("pluginId"), "pluginId property not found");
            assert(plugin.hasOwnProperty("plugin"), "plugin property not found");
        });
    }
}

export type TestConfigPlugin = {
    pluginId: string;
    plugin: TextlintPluginCreator;
    options?: any;
};
export type TestConfigRule = {
    ruleId: string;
    rule: TextlintRuleCreator;
    options?: any;
};
export type TestConfig = {
    plugins?: TestConfigPlugin[];
    rules: TestConfigRule[];
};

function isTestConfig(arg: any): arg is TestConfig {
    if (arg.hasOwnProperty("rules")) {
        return true;
    }
    if (typeof arg.fixer === "function" || typeof arg === "function") {
        return false;
    }
    return true;
}

export type TesterValid =
    | string
    | {
          text?: string;
          ext?: string;
          inputPath?: string;
          options?: any;
      };

export type TesterInvalid = {
    text?: string;
    output?: string;
    ext?: string;
    inputPath?: string;
    options?: any;
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

    testValidPattern(name: string, param: TextlintRuleCreator | TestConfig, valid: TesterValid) {
        const text = typeof valid === "object" ? valid.text : valid;
        const inputPath = typeof valid === "object" ? valid.inputPath : undefined;
        const ext = typeof valid === "object" && valid.ext !== undefined ? valid.ext : ".md";
        const textlint = new TextLintCore();
        if (isTestConfig(param)) {
            const rules: any = {};
            const rulesOptions: any = {};
            param.rules.forEach(rule => {
                const ruleName = rule.ruleId;
                const ruleObject = rule.rule;
                const ruleOptions = rule.options || {};
                rules[ruleName] = ruleObject;
                rulesOptions[ruleName] = ruleOptions;
            });
            textlint.setupRules(rules, rulesOptions);
            if (param.plugins !== undefined) {
                param.plugins.forEach(plugin => {
                    const pluginName = plugin.pluginId;
                    const pluginObject = plugin.plugin;
                    const pluginOptions = plugin.options || {};
                    textlint.setupPlugins(
                        {
                            [pluginName]: pluginObject
                        },
                        {
                            [pluginName]: pluginOptions
                        }
                    );
                });
            }
        } else {
            const options = (typeof valid === "object" && valid.options) || {};
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

    testInvalidPattern(name: string, param: TextlintRuleCreator | TestConfig, invalid: TesterInvalid) {
        const errors = invalid.errors;
        const inputPath = invalid.inputPath;
        const text = invalid.text;
        const ext = invalid.ext !== undefined ? invalid.ext : ".md";
        const textlint = new TextLintCore();
        if (isTestConfig(param)) {
            const rules: any = {};
            const rulesOptions: any = {};
            param.rules.forEach(rule => {
                const ruleName = rule.ruleId;
                const ruleObject = rule.rule;
                const ruleOptions = rule.options || {};
                rules[ruleName] = ruleObject;
                rulesOptions[ruleName] = ruleOptions;
            });
            textlint.setupRules(rules, rulesOptions);
            if (param.plugins !== undefined) {
                param.plugins.forEach(plugin => {
                    const pluginName = plugin.pluginId;
                    const pluginObject = plugin.plugin;
                    const pluginOptions = plugin.options || {};
                    textlint.setupPlugins(
                        {
                            [pluginName]: pluginObject
                        },
                        {
                            [pluginName]: pluginOptions
                        }
                    );
                });
            }
        } else {
            const options = invalid.options || {};
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
                if (isTestConfig(param)) {
                    (param as TestConfig).rules.forEach(rule => {
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
     * @param {TextlintRuleCreator|TestConfig} param param is TextlintRuleCreator or TestConfig
     * @param {string[]|object[]} [valid]
     * @param {object[]} [invalid]
     */
    run(
        name: string,
        param: TextlintRuleCreator | TestConfig,
        {
            valid = [],
            invalid = []
        }: {
            valid?: TesterValid[];
            invalid?: TesterInvalid[];
        }
    ) {
        if (isTestConfig(param)) {
            assertTestConfig(param);
        }

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
