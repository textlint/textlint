import { createPluginStub } from "./helper/ExamplePlugin";
import { errorRule } from "./helper/ErrorRule";
import { TextlintKernel } from "../src";
import * as assert from "assert";

describe("kernel-plugin", () => {
    describe("#processor", () => {
        it("should receive extension", () => {
            const kernel = new TextlintKernel();
            const { getPlugin, getProcessorArgs } = createPluginStub();
            const options = {
                filePath: "/path/to/file.md",
                ext: ".md",
                plugins: [{ pluginId: "example", plugin: getPlugin() }],
                rules: [{ ruleId: "error", rule: errorRule }]
            };
            const text = "text";
            return kernel.lintText(text, options).then(_result => {
                assert.strictEqual(getProcessorArgs()[0], options.ext);
            });
        });
    });
    describe("#preProcess", () => {
        it("preProcess should be called with text and filePath", () => {
            const kernel = new TextlintKernel();
            const { getPlugin, getPreProcessArgs } = createPluginStub();
            const options = {
                filePath: "/path/to/file.md",
                ext: ".md",
                plugins: [{ pluginId: "example", plugin: getPlugin() }],
                rules: [{ ruleId: "error", rule: errorRule }]
            };
            const text = "text";
            return kernel.lintText(text, options).then(_result => {
                assert.strictEqual(getPreProcessArgs()[0], text);
                assert.strictEqual(getPreProcessArgs()[1], options.filePath);
            });
        });
    });
    describe("#postProcess", () => {
        it("preProcess should be called with messages and filePath", () => {
            const kernel = new TextlintKernel();
            const { getPlugin, getPostProcessArgs } = createPluginStub();
            const options = {
                filePath: "/path/to/file.md",
                ext: ".md",
                plugins: [{ pluginId: "example", plugin: getPlugin() }],
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
                assert.strictEqual(getPostProcessArgs()[0].length, options.rules[0].options.errors.length);
                assert.strictEqual(getPostProcessArgs()[1], options.filePath);
            });
        });
    });
});
