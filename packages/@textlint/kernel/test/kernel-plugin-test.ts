import { createPluginStub } from "./helper/ExamplePlugin";
import { errorRule } from "./helper/ErrorRule";
import { TextlintKernel } from "../src";
import * as assert from "assert";

describe("kernel-plugin", () => {
    describe("#constructor", () => {
        it("should receive {} by default", () => {
            const kernel = new TextlintKernel();
            const { plugin, getOptions } = createPluginStub();
            const options = {
                filePath: "/path/to/file.md",
                ext: ".md",
                plugins: [{ pluginId: "example", plugin: plugin }],
                rules: [{ ruleId: "error", rule: errorRule }]
            };
            const text = "text";
            return kernel.lintText(text, options).then(_result => {
                assert.deepStrictEqual(getOptions(), {});
            });
        });
        it("should receive {} when pass `true`", () => {
            const kernel = new TextlintKernel();
            const { plugin, getOptions } = createPluginStub();
            const options = {
                filePath: "/path/to/file.md",
                ext: ".md",
                plugins: [{ pluginId: "example", plugin: plugin, options: true }],
                rules: [{ ruleId: "error", rule: errorRule }]
            };
            const text = "text";
            return kernel.lintText(text, options).then(_result => {
                assert.deepStrictEqual(getOptions(), {});
            });
        });
        it("should receive object when pass plugin's option", () => {
            const kernel = new TextlintKernel();
            const { plugin, getOptions } = createPluginStub();
            const PASS_OPTIONS = { key: "value" };
            const options = {
                filePath: "/path/to/file.md",
                ext: ".md",
                plugins: [{ pluginId: "example", plugin: plugin, options: PASS_OPTIONS }],
                rules: [{ ruleId: "error", rule: errorRule }]
            };
            const text = "text";
            return kernel.lintText(text, options).then(_result => {
                assert.deepStrictEqual(getOptions(), PASS_OPTIONS);
            });
        });
    });
    describe("#processor", () => {
        it("should receive extension", () => {
            const kernel = new TextlintKernel();
            const { plugin, getProcessorArgs } = createPluginStub();
            const options = {
                filePath: "/path/to/file.md",
                ext: ".md",
                plugins: [{ pluginId: "example", plugin: plugin }],
                rules: [{ ruleId: "error", rule: errorRule }]
            };
            const text = "text";
            return kernel.lintText(text, options).then(_result => {
                assert.strictEqual(getProcessorArgs().extension, options.ext);
            });
        });
    });
    describe("#preProcess", () => {
        it("preProcess should be called with text and filePath", () => {
            const kernel = new TextlintKernel();
            const { plugin, getPreProcessArgs } = createPluginStub();
            const options = {
                filePath: "/path/to/file.md",
                ext: ".md",
                plugins: [{ pluginId: "example", plugin: plugin }],
                rules: [{ ruleId: "error", rule: errorRule }]
            };
            const text = "text";
            return kernel.lintText(text, options).then(_result => {
                assert.strictEqual(getPreProcessArgs().text, text);
                assert.strictEqual(getPreProcessArgs().filePath, options.filePath);
            });
        });
    });
    describe("#postProcess", () => {
        it("preProcess should be called with messages and filePath", () => {
            const kernel = new TextlintKernel();
            const { plugin, getPostProcessArgs } = createPluginStub();
            const options = {
                filePath: "/path/to/file.md",
                ext: ".md",
                plugins: [{ pluginId: "example", plugin: plugin }],
                rules: [
                    {
                        ruleId: "error",
                        rule: errorRule,
                        options: {
                            errors: [
                                {
                                    index: 0,
                                    message: "ERROR"
                                }
                            ]
                        }
                    }
                ]
            };
            const text = "text";
            return kernel.lintText(text, options).then(_result => {
                assert.strictEqual(getPostProcessArgs().messages.length, options.rules[0].options.errors.length);
                assert.strictEqual(getPostProcessArgs().filePath, options.filePath);
            });
        });
    });
});
