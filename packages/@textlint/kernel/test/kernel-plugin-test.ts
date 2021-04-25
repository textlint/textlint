import { createPluginStub } from "./helper/ExamplePlugin";
import { errorRule } from "./helper/ErrorRule";
import { TextlintKernel } from "../src";
import * as path from "path";
import * as assert from "assert";
import { createBinaryPluginStub } from "./helper/BinaryPlugin";
import type { TextlintRuleReporter } from "@textlint/types";

describe("kernel-plugin", () => {
    describe("binary plugin", () => {
        it("should get dummyText via context.getSource", () => {
            const kernel = new TextlintKernel();
            const expectedSourceText = "This is binary";
            const binaryFilePath = path.join(__dirname, "fixtures/binary/a.out");
            const { plugin } = createBinaryPluginStub({
                // return pseudoText instead of binary content as preProcess result
                dummyText: expectedSourceText
            });
            let strCalledNum = 0;
            const rule: TextlintRuleReporter = (context) => {
                const { Syntax, getSource, getFilePath } = context;
                return {
                    [Syntax.Str](node) {
                        const text = getSource(node);
                        const marginText = getSource(node, -1, -1);
                        assert.strictEqual(text, expectedSourceText);
                        assert.strictEqual(marginText, expectedSourceText.slice(1, expectedSourceText.length - 1));
                        const filePath = getFilePath();
                        assert.strictEqual(filePath, binaryFilePath);
                        strCalledNum++;
                    }
                };
            };
            const options = {
                filePath: binaryFilePath,
                ext: ".out",
                plugins: [{ pluginId: "binary", plugin: plugin }],
                rules: [
                    {
                        ruleId: "error",
                        rule: rule
                    }
                ]
            };

            kernel.lintTextSync("text", options);
            assert.strictEqual(strCalledNum, 1);

            return kernel.lintText("text", options).then((_result) => {
                assert.strictEqual(strCalledNum, 2);
            });
        });
    });
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

            kernel.lintTextSync("text", options);
            assert.deepStrictEqual(getOptions(), {});

            return kernel.lintText(text, options).then((_result) => {
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

            kernel.lintTextSync("text", options);
            assert.deepStrictEqual(getOptions(), {});

            return kernel.lintText(text, options).then((_result) => {
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

            kernel.lintTextSync("text", options);
            assert.deepStrictEqual(getOptions(), PASS_OPTIONS);

            const text = "text";
            return kernel.lintText(text, options).then((_result) => {
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

            kernel.lintTextSync("text", options);
            assert.strictEqual(getProcessorArgs().extension, options.ext);

            return kernel.lintText(text, options).then((_result) => {
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

            kernel.lintTextSync("text", options);
            assert.strictEqual(getPreProcessArgs().text, text);
            assert.strictEqual(getPreProcessArgs().filePath, options.filePath);

            return kernel.lintText(text, options).then((_result) => {
                assert.strictEqual(getPreProcessArgs().text, text);
                assert.strictEqual(getPreProcessArgs().filePath, options.filePath);
            });
        });
        it("preProcess can return {text, ast}", () => {
            const kernel = new TextlintKernel();
            const { plugin, getPreProcessArgs } = createBinaryPluginStub();
            const options = {
                filePath: path.join(__dirname, "fixtures/binary/a.out"),
                ext: ".out",
                plugins: [{ pluginId: "example", plugin: plugin }],
                rules: [{ ruleId: "error", rule: errorRule }]
            };
            const text = "text";

            kernel.lintTextSync("text", options);
            assert.strictEqual(getPreProcessArgs().text, text);
            assert.strictEqual(getPreProcessArgs().filePath, options.filePath);

            return kernel.lintText(text, options).then((_result) => {
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

            kernel.lintTextSync("text", options);
            assert.strictEqual(getPostProcessArgs().messages.length, options.rules[0].options.errors.length);
            assert.strictEqual(getPostProcessArgs().filePath, options.filePath);

            return kernel.lintText(text, options).then((_result) => {
                assert.strictEqual(getPostProcessArgs().messages.length, options.rules[0].options.errors.length);
                assert.strictEqual(getPostProcessArgs().filePath, options.filePath);
            });
        });
    });
});
