// LICENSE : MIT
"use strict";
import * as assert from "assert";
import { testInvalid, testValid } from "./test-util";
import {
    TextlintFixResult,
    TextlintKernel,
    TextlintKernelDescriptor,
    TextlintKernelPlugin,
    TextlintPluginCreator,
    TextlintRuleModule
} from "@textlint/kernel";
import { coreFlags } from "@textlint/feature-flag";
import textPlugin from "@textlint/textlint-plugin-text";
import markdownPlugin from "@textlint/textlint-plugin-markdown";
import fs from "fs/promises";
import path from "path";
import { TextlintPluginOptions, TextlintRuleOptions } from "@textlint/types";

const hasOwnProperty = Object.prototype.hasOwnProperty;
const globalObject = globalThis;
/* eslint-disable no-invalid-this */
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
        assert.ok(hasOwnProperty.call(rule, "ruleId"), "ruleId property not found");
        assert.ok(hasOwnProperty.call(rule, "rule"), "rule property not found");
    });
    if (typeof testConfig.plugins !== "undefined") {
        assert.ok(Array.isArray(testConfig.plugins), "TestConfig.plugins should be an array");
        testConfig.plugins.forEach((plugin) => {
            assert.ok(hasOwnProperty.call(plugin, "pluginId"), "pluginId property not found");
            assert.ok(hasOwnProperty.call(plugin, "plugin"), "plugin property not found");
        });
    }
}

export type TestConfigPlugin = {
    pluginId: string;
    plugin: TextlintPluginCreator;
    options?: TextlintPluginOptions | boolean;
};
export type TestConfigRule = {
    ruleId: string;
    rule: TextlintRuleModule;
    options?: TextlintRuleOptions | boolean;
};
export type TestConfig = {
    plugins?: TestConfigPlugin[];
    rules: TestConfigRule[];
};

function isTestConfig(arg: any): arg is TestConfig {
    if (hasOwnProperty.call(arg, "rules")) {
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

export type TesterErrorDefinition = {
    ruleId?: string;
    range?: readonly [startIndex: number, endIndex: number];
    loc?: {
        start: {
            line: number;
            column: number;
        };
        end: {
            line: number;
            column: number;
        };
    };
    /**
     * @deprecated use `range` option
     */
    index?: number;
    /**
     * @deprecated use `loc` option
     */
    line?: number;
    /**
     * @deprecated use `loc` option
     */
    column?: number;
    message?: string;
};
export type TesterInvalid = {
    text?: string;
    output?: string;
    ext?: string;
    inputPath?: string;
    options?: any;
    errors: TesterErrorDefinition[];
};

export type TestRuleSet = {
    rules: { [index: string]: TextlintRuleModule };
    rulesOptions: any;
};

export type TestPluginSet = {
    plugins: { [index: string]: TextlintPluginCreator };
    pluginOptions: any;
};

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

const builtInPlugins: TextlintKernelPlugin[] = [
    {
        pluginId: "@textlint/textlint-plugin-text",
        plugin: textPlugin,
        options: true
    },
    {
        pluginId: "@textlint/textlint-plugin-markdown",
        plugin: markdownPlugin,
        options: true
    }
];

interface CreateTextlintKernelDescriptorArgs {
    testName: string;
    // base rule definition
    testRuleDefinition: TextlintRuleModule | TestConfig;
    // each test case options
    testCaseOptions?: TestConfigRule["options"];
}

const createTextlintKernelDescriptor = ({
    testName,
    testRuleDefinition,
    testCaseOptions
}: CreateTextlintKernelDescriptorArgs): TextlintKernelDescriptor => {
    if (isTestConfig(testRuleDefinition)) {
        const testConfig = testRuleDefinition;
        assertTestConfig(testConfig);
        // Note: testCaseOptions is not supported and it will be just ignored.
        // Assertion check it
        // > Could not specify options property in valid object when TestConfig was passed. Use TestConfig.rules.options.
        const testPluginSet = createTestPluginSet(testConfig.plugins || []);
        const plugins = [
            ...builtInPlugins,
            ...Object.keys(testPluginSet.plugins).map((pluginId) => {
                return {
                    pluginId,
                    plugin: testPluginSet.plugins[pluginId],
                    options: testPluginSet.pluginOptions[pluginId]
                };
            })
        ];
        return new TextlintKernelDescriptor({
            rules: testConfig.rules,
            filterRules: [],
            plugins
        });
    } else {
        return new TextlintKernelDescriptor({
            rules: [
                {
                    ruleId: testName,
                    rule: testRuleDefinition,
                    options: testCaseOptions
                }
            ],
            filterRules: [],
            plugins: builtInPlugins
        });
    }
};

const createTestLinter = (textlintKernelDescriptor: TextlintKernelDescriptor) => {
    const kernel = new TextlintKernel();
    return {
        async lintText(text: string, ext: string) {
            return kernel.lintText(text, {
                ext,
                ...textlintKernelDescriptor.toKernelOptions()
            });
        },
        async lintFile(filePath: string) {
            const text = await fs.readFile(filePath, "utf-8");
            const ext = path.extname(filePath);
            return kernel.lintText(text, {
                ext,
                filePath,
                ...textlintKernelDescriptor.toKernelOptions()
            });
        },
        async fixText(text: string, ext: string) {
            return kernel.fixText(text, {
                ext,
                ...textlintKernelDescriptor.toKernelOptions()
            });
        },
        async fixFile(filePath: string) {
            const text = await fs.readFile(filePath, "utf-8");
            const ext = path.extname(filePath);
            return kernel.fixText(text, {
                ext,
                filePath,
                ...textlintKernelDescriptor.toKernelOptions()
            });
        }
    };
};

export class TextLintTester {
    constructor() {
        if (typeof coreFlags === "object") {
            coreFlags.runningTester = true;
        }
    }

    testValidPattern(testName: string, param: TextlintRuleModule | TestConfig, valid: TesterValid) {
        const text = typeof valid === "object" ? valid.text : valid;
        const inputPath = typeof valid === "object" ? valid.inputPath : undefined;
        const ext = typeof valid === "object" && valid.ext !== undefined ? valid.ext : ".md";
        const options = typeof valid === "object" && valid.options !== undefined ? valid.options : undefined;
        const textlint = createTestLinter(
            createTextlintKernelDescriptor({
                testName,
                testRuleDefinition: param,
                testCaseOptions: options
            })
        );
        const textCaseName = `${inputPath || text}`;
        it(textCaseName, () => {
            if (inputPath) {
                return testValid({
                    textlint,
                    inputPath
                });
            } else if (text && ext) {
                return testValid({
                    textlint,
                    text,
                    ext
                });
            }
            throw new Error(`valid should have text or inputPath property.
            
valid: [ "text", { text: "text" }, { inputPath: "path/to/file" } ]

`);
        });
    }

    testInvalidPattern(testName: string, param: TextlintRuleModule | TestConfig, invalid: TesterInvalid) {
        const errors = invalid.errors;
        const inputPath = invalid.inputPath;
        const text = invalid.text;
        const ext = invalid.ext !== undefined ? invalid.ext : ".md";
        const options = invalid.options !== undefined ? invalid.options : undefined;
        const textlint = createTestLinter(
            createTextlintKernelDescriptor({
                testName,
                testRuleDefinition: param,
                testCaseOptions: options
            })
        );
        const testCaseName = `${inputPath || text}`;
        it(testCaseName, () => {
            if (inputPath) {
                return testInvalid({
                    textlint,
                    inputPath,
                    errors
                });
            } else if (text && ext) {
                return testInvalid({
                    textlint,
                    text,
                    ext,
                    errors
                });
            }
            throw new Error(`invalid should have { text } or { inputPath } property. 
            
invalid: [ { text: "text", errors: [...] }, { inputPath: "path/to/file", errors: [...] } ]

`);
        });
        // --fix
        if (hasOwnProperty.call(invalid, "output")) {
            it(`Fixer: ${testCaseName}`, () => {
                if (isTestConfig(param)) {
                    param.rules.forEach((rule) => {
                        assertHasFixer(rule.rule, rule.ruleId);
                    });
                } else {
                    assertHasFixer(param, testName);
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
     * @param {TextlintRuleModule|TestConfig} testRuleDefinition param is TextlintRuleCreator or TestConfig
     * @param {string[]|object[]} [valid]
     * @param {object[]} [invalid]
     */
    run(
        name: string,
        testRuleDefinition: TextlintRuleModule | TestConfig,
        {
            valid = [],
            invalid = []
        }: {
            valid?: TesterValid[];
            invalid?: TesterInvalid[];
        }
    ) {
        if (isTestConfig(testRuleDefinition)) {
            assertTestConfig(testRuleDefinition);
            if (valid) {
                valid.forEach((validCase) => {
                    assert.ok(
                        !hasOwnProperty.call(validCase, "options"),
                        "Could not specify options property in valid object when TestConfig was passed. Use TestConfig.rules.options."
                    );
                });
            }
            if (invalid) {
                invalid.forEach((invalidCase) => {
                    assert.ok(
                        !hasOwnProperty.call(invalidCase, "options"),
                        "Could not specify options property in invalid object when TestConfig was passed. Use TestConfig.rules.options."
                    );
                });
            }
        }

        describe(name, () => {
            invalid.forEach((state) => {
                this.testInvalidPattern(name, testRuleDefinition, state);
            });
            valid.forEach((state) => {
                this.testValidPattern(name, testRuleDefinition, state);
            });
        });
    }
}
