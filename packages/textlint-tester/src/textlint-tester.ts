// LICENSE : MIT
"use strict";
import * as assert from "assert";
import { testInvalid, testValid } from "./test-util";
import { TextLintCore } from "textlint";
import { TextlintFixResult, TextlintPluginCreator, TextlintRuleModule } from "@textlint/kernel";
import { coreFlags } from "@textlint/feature-flag";
import type { TxtParentNode } from "@textlint/ast-node-types";

/* eslint-disable no-invalid-this */
const globalObject: any = global;
const describe =
    typeof globalObject.describe === "function"
        ? globalObject.describe
        : function (this: any, _text: string, method: () => any) {
              return method.apply(this);
          };

const it =
    typeof globalObject.it === "function"
        ? globalObject.it
        : function (this: any, _text: string, method: () => any) {
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
    assert.ok(Array.isArray(testConfig.rules), "TestConfig.rules should be an array");
    assert.ok(testConfig.rules.length > 0, "TestConfig.rules should have at least one rule");
    testConfig.rules.forEach((rule) => {
        assert.ok(rule.hasOwnProperty("ruleId"), "ruleId property not found");
        assert.ok(rule.hasOwnProperty("rule"), "rule property not found");
    });
    if (typeof testConfig.plugins !== "undefined") {
        assert.ok(Array.isArray(testConfig.plugins), "TestConfig.plugins should be an array");
        testConfig.plugins.forEach((plugin) => {
            assert.ok(plugin.hasOwnProperty("pluginId"), "pluginId property not found");
            assert.ok(plugin.hasOwnProperty("plugin"), "plugin property not found");
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

function createTestRuleSet(testConfigRules: TestConfigRule[]) {
    const targetAST = {} as { before: TxtParentNode; after: TxtParentNode };
    const testRuleSet: TestRuleSet = {
        rules: {
            "textlint-tester/validate-ast": (context) => {
                return {
                    [context.Syntax.Document](node) {
                        targetAST.before = deepCloneWithoutParent(node);
                    },
                    [context.Syntax.DocumentExit](node) {
                        targetAST.after = node;
                    }
                };
            }
        },
        rulesOptions: {
            "textlint-tester/validate-ast": true
        }
    };
    testConfigRules.forEach((rule) => {
        const ruleName = rule.ruleId;
        const ruleOptions = rule.options;
        testRuleSet.rules[ruleName] = rule.rule;
        testRuleSet.rulesOptions[ruleName] = ruleOptions;
    });
    return {
        targetAST,
        testRuleSet
    };
}

/**
 * Clones a given value deeply without `parent` property.
 */
function deepCloneWithoutParent(x: any): any {
    if (typeof x === "object" && x !== null) {
        if (Array.isArray(x)) {
            return x.map((item) => deepCloneWithoutParent(item));
        }
        const o: Record<string, any> = {};
        Object.keys(x).forEach((key) => {
            if (key !== "parent") {
                o[key] = deepCloneWithoutParent(x[key]);
            }
        });
        return o;
    }
    return x;
}

function createSingleRuleSet({ name, rule, options }: { name: string; rule: TextlintRuleModule; options: any }) {
    const targetAST = {} as { before: TxtParentNode; after: TxtParentNode };
    const testRuleSet: TestRuleSet = {
        rules: {
            "textlint-tester/validate-ast": (context) => {
                return {
                    [context.Syntax.Document](node) {
                        targetAST.before = deepCloneWithoutParent(node);
                    },
                    [context.Syntax.DocumentExit](node) {
                        targetAST.after = node;
                    }
                };
            },
            [name]: rule
        },
        rulesOptions: {
            "textlint-tester/validate-ast": true,
            [name]: options
        }
    };
    return {
        targetAST,
        testRuleSet
    };
}

function createTestPluginSet(testConfigPlugins: TestConfigPlugin[]): TestPluginSet {
    const testPluginSet: TestPluginSet = {
        plugins: {},
        pluginOptions: {}
    };
    testConfigPlugins.forEach((plugin) => {
        const pluginName = plugin.pluginId;
        const pluginOptions = plugin.options;
        testPluginSet.plugins[pluginName] = plugin.plugin;
        testPluginSet.pluginOptions[pluginName] = pluginOptions;
    });
    return testPluginSet;
}

export class TextLintTester {
    constructor() {
        if (typeof coreFlags === "object") {
            coreFlags.runningTester = true;
        }
    }

    testValidPattern(name: string, param: TextlintRuleModule | TestConfig, valid: TesterValid) {
        const text = typeof valid === "object" ? valid.text : valid;
        const inputPath = typeof valid === "object" ? valid.inputPath : undefined;
        const ext = typeof valid === "object" && valid.ext !== undefined ? valid.ext : ".md";
        const textlint = new TextLintCore();
        const targetAST = (() => {
            if (isTestConfig(param)) {
                const { testRuleSet, targetAST } = createTestRuleSet(param.rules);
                textlint.setupRules(testRuleSet.rules, testRuleSet.rulesOptions);
                if (param.plugins !== undefined) {
                    const testPluginSet = createTestPluginSet(param.plugins);
                    textlint.setupPlugins(testPluginSet.plugins, testPluginSet.pluginOptions);
                }
                return targetAST;
            } else {
                const options =
                    typeof valid === "object"
                        ? valid.options
                        : // just enable
                          true;
                const { testRuleSet, targetAST } = createSingleRuleSet({
                    name,
                    rule: param,
                    options
                });
                textlint.setupRules(testRuleSet.rules, testRuleSet.rulesOptions);
                return targetAST;
            }
        })();
        it(inputPath || text, () => {
            return testValid({
                textlint,
                inputPath,
                text,
                ext,
                targetAST
            });
        });
    }

    testInvalidPattern(name: string, param: TextlintRuleModule | TestConfig, invalid: TesterInvalid) {
        const errors = invalid.errors;
        const inputPath = invalid.inputPath;
        const text = invalid.text;
        const ext = invalid.ext !== undefined ? invalid.ext : ".md";
        const textlint = new TextLintCore();
        const targetAST = (() => {
            if (isTestConfig(param)) {
                const { testRuleSet, targetAST } = createTestRuleSet(param.rules);
                textlint.setupRules(testRuleSet.rules, testRuleSet.rulesOptions);
                if (Array.isArray(param.plugins)) {
                    const testPluginSet = createTestPluginSet(param.plugins);
                    textlint.setupPlugins(testPluginSet.plugins, testPluginSet.pluginOptions);
                }
                return targetAST;
            } else {
                const options = invalid.options;
                const { testRuleSet, targetAST } = createSingleRuleSet({
                    name,
                    rule: param,
                    options
                });
                textlint.setupRules(testRuleSet.rules, testRuleSet.rulesOptions);
                return targetAST;
            }
        })();
        it(inputPath || text, () => {
            return testInvalid({
                textlint,
                inputPath,
                text,
                ext,
                errors,
                targetAST
            });
        });
        // --fix
        if (invalid.hasOwnProperty("output")) {
            it(`Fixer: ${inputPath || text}`, () => {
                if (isTestConfig(param)) {
                    param.rules.forEach((rule) => {
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
                return promise.then((result) => {
                    const output = invalid.output;
                    assert.strictEqual(result.output, output);
                });
            });
        }
    }

    /**
     * run test for textlint rule.
     * @param {string} name name is name of the test or rule
     * @param {TextlintRuleModule|TestConfig} param param is TextlintRuleCreator or TestConfig
     * @param {string[]|object[]} [valid]
     * @param {object[]} [invalid]
     */
    run(
        name: string,
        param: TextlintRuleModule | TestConfig,
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
            if (valid) {
                valid.forEach((validCase) => {
                    assert.ok(
                        !validCase.hasOwnProperty("options"),
                        "Could not specify options property in valid object when TestConfig was passed. Use TestConfig.rules.options."
                    );
                });
            }
            if (invalid) {
                invalid.forEach((invalidCase) => {
                    assert.ok(
                        !invalidCase.hasOwnProperty("options"),
                        "Could not specify options property in invalid object when TestConfig was passed. Use TestConfig.rules.options."
                    );
                });
            }
        }

        describe(name, () => {
            invalid.forEach((state) => {
                this.testInvalidPattern(name, param, state);
            });
            valid.forEach((state) => {
                this.testValidPattern(name, param, state);
            });
        });
    }
}
