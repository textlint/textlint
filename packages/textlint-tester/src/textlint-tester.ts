// LICENSE : MIT
"use strict";
import * as assert from "assert";
import { testInvalid, testValid } from "./test-util";
import { TextLintCore } from "textlint";
import { TextlintKernelDescriptor } from "@textlint/kernel";
import { TextlintFixResult, TextlintPluginCreator, TextlintRuleModule } from "@textlint/kernel";
import { snapshotTest, TesterSnapshot } from "./snapshot-test";

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
    assert(testConfig.rules.length > 0, "TestConfig.rules should have at least one rule");
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
    rule: TextlintRuleModule;
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

export type TestRuleSet = {
    rules: { [index: string]: TextlintRuleModule };
    rulesOptions: any;
};

export type TestPluginSet = {
    plugins: { [index: string]: TextlintPluginCreator };
    pluginOptions: any;
};

function createTestRuleSet(testConfigRules: TestConfigRule[]): TestRuleSet {
    const testRuleSet: TestRuleSet = {
        rules: {},
        rulesOptions: {}
    };
    testConfigRules.forEach(rule => {
        const ruleName = rule.ruleId;
        const ruleOptions = rule.options;
        testRuleSet.rules[ruleName] = rule.rule;
        testRuleSet.rulesOptions[ruleName] = ruleOptions;
    });
    return testRuleSet;
}

function createTestPluginSet(testConfigPlugins: TestConfigPlugin[]): TestPluginSet {
    const testPluginSet: TestPluginSet = {
        plugins: {},
        pluginOptions: {}
    };
    testConfigPlugins.forEach(plugin => {
        const pluginName = plugin.pluginId;
        const pluginOptions = plugin.options;
        testPluginSet.plugins[pluginName] = plugin.plugin;
        testPluginSet.pluginOptions[pluginName] = pluginOptions;
    });
    return testPluginSet;
}

export interface TextLintTesterOptions {
    snapshotFileName?: string;
}

export class TextLintTester {
    constructor(private options: TextLintTesterOptions = {}) {
        if (typeof coreFlags === "object") {
            coreFlags.runningTester = true;
        }
    }

    testValidPattern(name: string, param: TextlintRuleModule | TestConfig, valid: TesterValid) {
        const text = typeof valid === "object" ? valid.text : valid;
        const inputPath = typeof valid === "object" ? valid.inputPath : undefined;
        const ext = typeof valid === "object" && valid.ext !== undefined ? valid.ext : ".md";
        const textlint = new TextLintCore();
        if (isTestConfig(param)) {
            const testRuleSet = createTestRuleSet(param.rules);
            textlint.setupRules(testRuleSet.rules, testRuleSet.rulesOptions);
            if (param.plugins !== undefined) {
                const testPluginSet = createTestPluginSet(param.plugins);
                textlint.setupPlugins(testPluginSet.plugins, testPluginSet.pluginOptions);
            }
        } else {
            const options =
                typeof valid === "object"
                    ? valid.options
                    : // just enable
                      true;
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

    testInvalidPattern(name: string, param: TextlintRuleModule | TestConfig, invalid: TesterInvalid) {
        const errors = invalid.errors;
        const inputPath = invalid.inputPath;
        const text = invalid.text;
        const ext = invalid.ext !== undefined ? invalid.ext : ".md";
        const textlint = new TextLintCore();
        if (isTestConfig(param)) {
            const testRuleSet = createTestRuleSet(param.rules);
            textlint.setupRules(testRuleSet.rules, testRuleSet.rulesOptions);
            if (Array.isArray(param.plugins)) {
                const testPluginSet = createTestPluginSet(param.plugins);
                textlint.setupPlugins(testPluginSet.plugins, testPluginSet.pluginOptions);
            }
        } else {
            const options = invalid.options;
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
                    param.rules.forEach(rule => {
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
     * Run test for textlint rule.
     */
    run(
        name: string,
        param: TextlintRuleModule | TestConfig,
        {
            valid = [],
            invalid = [],
            snapshots = []
        }: {
            valid?: TesterValid[];
            invalid?: TesterInvalid[];
            snapshots?: TesterSnapshot[];
        }
    ) {
        if (isTestConfig(param)) {
            assertTestConfig(param);
            if (valid) {
                valid.forEach(validCase => {
                    assert(
                        !validCase.hasOwnProperty("options"),
                        "Could not specify options property in valid object when TestConfig was passed. Use TestConfig.rules.options."
                    );
                });
            }
            if (invalid) {
                invalid.forEach(invalidCase => {
                    assert(
                        !invalidCase.hasOwnProperty("options"),
                        "Could not specify options property in invalid object when TestConfig was passed. Use TestConfig.rules.options."
                    );
                });
            }
        }
        describe(name, () => {
            const createTextlint = (options: any) => {
                const textlint = new TextLintCore();
                if (isTestConfig(param)) {
                    const testRuleSet = createTestRuleSet(param.rules);
                    textlint.setupRules(testRuleSet.rules, testRuleSet.rulesOptions);
                    if (Array.isArray(param.plugins)) {
                        const testPluginSet = createTestPluginSet(param.plugins);
                        textlint.setupPlugins(testPluginSet.plugins, testPluginSet.pluginOptions);
                    }
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
                return textlint;
            };
            const hasFixableRuleDescriptors = (options: any): boolean => {
                const rules = isTestConfig(param)
                    ? param.rules
                    : [
                          {
                              ruleId: name,
                              rule: param,
                              options: options
                          }
                      ];
                const descriptors = new TextlintKernelDescriptor({
                    rules: rules,
                    filterRules: [],
                    plugins: []
                });
                return descriptors.rule.fixableDescriptors.length > 0;
            };
            invalid.forEach(state => {
                this.testInvalidPattern(name, param, state);
            });
            valid.forEach(state => {
                this.testValidPattern(name, param, state);
            });
            snapshots.forEach(state => {
                const textlint = createTextlint(state.options);
                const snapshotFileName = this.options.snapshotFileName;
                if (!snapshotFileName) {
                    throw new Error(`should pass snapshotFileName to constructor for snapshot testing.

import { TextLintTester } from "textlint-tester";

const tester = new TextLintTester({
    snapshotFileName: __filename,
});
`);
                }
                snapshotTest(textlint, state, {
                    snapshotFileName,
                    fix: hasFixableRuleDescriptors(state.options)
                });
            });
        });
    }
}
