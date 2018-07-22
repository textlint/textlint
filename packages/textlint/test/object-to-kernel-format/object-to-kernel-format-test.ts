import {
    filterRulesObjectToKernelRule,
    pluginsObjectToKernelRule,
    rulesObjectToKernelRule
} from "../../src/util/object-to-kernel-format";
import * as assert from "assert";

const exampleRule = require("./fixtures/example-rule.js");
const exampleFilterRule = require("./fixtures/example-filter-rule.js");
const examplePlugin = require("./fixtures/example-plugin.js");
describe("object-to-kernel-format", () => {
    describe("rulesObjectToKernelRule", () => {
        it("should return kernel format with true", () => {
            const rules = {
                example: exampleRule
            };
            const rulesOption = {
                example: true
            };
            const result = rulesObjectToKernelRule(rules, rulesOption);
            assert.deepStrictEqual(result, [
                {
                    ruleId: "example",
                    rule: exampleRule,
                    options: true
                }
            ]);
        });
        it("should return kernel format with false", () => {
            const rules = {
                example: exampleRule
            };
            const rulesOption = {
                example: false
            };
            const result = rulesObjectToKernelRule(rules, rulesOption);
            assert.deepStrictEqual(result, [
                {
                    ruleId: "example",
                    rule: exampleRule,
                    options: false
                }
            ]);
        });
        it("should return kernel format with option object", () => {
            const rules = {
                example: exampleRule
            };
            const rulesOption = {
                example: {}
            };
            const result = rulesObjectToKernelRule(rules, rulesOption);
            assert.deepStrictEqual(result, [
                {
                    ruleId: "example",
                    rule: exampleRule,
                    options: rulesOption.example
                }
            ]);
        });
    });
    describe("filterRulesObjectToKernelRule", () => {
        it("should return kernel format with true", () => {
            const rules = {
                example: exampleFilterRule
            };
            const rulesOption = {
                example: true
            };
            const result = filterRulesObjectToKernelRule(rules, rulesOption);
            assert.deepStrictEqual(result, [
                {
                    ruleId: "example",
                    rule: exampleFilterRule,
                    options: true
                }
            ]);
        });
        it("should return kernel format with false", () => {
            const rules = {
                example: exampleFilterRule
            };
            const rulesOption = {
                example: false
            };
            const result = filterRulesObjectToKernelRule(rules, rulesOption);
            assert.deepStrictEqual(result, [
                {
                    ruleId: "example",
                    rule: exampleFilterRule,
                    options: false
                }
            ]);
        });
        it("should return kernel format with option object", () => {
            const rules = {
                example: exampleFilterRule
            };
            const rulesOption = {
                example: {}
            };
            const result = filterRulesObjectToKernelRule(rules, rulesOption);
            assert.deepStrictEqual(result, [
                {
                    ruleId: "example",
                    rule: exampleFilterRule,
                    options: rulesOption.example
                }
            ]);
        });
    });

    describe("pluginsObjectToKernelRule", () => {
        it("should return kernel format with true", () => {
            const plugins = {
                example: examplePlugin
            };
            const pluginsOption = {
                example: true
            };
            const result = pluginsObjectToKernelRule(plugins, pluginsOption);
            assert.deepStrictEqual(result, [
                {
                    pluginId: "example",
                    plugin: examplePlugin,
                    options: true
                }
            ]);
        });
        it("should return kernel format with false", () => {
            const plugins = {
                example: examplePlugin
            };
            const pluginsOption = {
                example: false
            };
            const result = pluginsObjectToKernelRule(plugins, pluginsOption);
            assert.deepStrictEqual(result, [
                {
                    pluginId: "example",
                    plugin: examplePlugin,
                    options: false
                }
            ]);
        });
        it("should return kernel format with option object", () => {
            const plugins = {
                example: examplePlugin
            };
            const pluginsOption = {
                example: {}
            };
            const result = pluginsObjectToKernelRule(plugins, pluginsOption);
            assert.deepStrictEqual(result, [
                {
                    pluginId: "example",
                    plugin: examplePlugin,
                    options: pluginsOption.example
                }
            ]);
        });
    });
});
