import { createPluginStub } from "./helper/ExamplePlugin";
import { errorRule } from "./helper/ErrorRule";
import { TextlintKernel, TextlintPluginCreator } from "../src";
import * as path from "path";
import * as assert from "assert";
import { createBinaryPluginStub } from "./helper/BinaryPlugin";
import { createAsyncPluginStub } from "./helper/AsyncPlugin";
import type { TextlintRuleReporter } from "@textlint/types";
import { TextlintKernelOptions } from "../src/textlint-kernel-interface";
import { TxtNode } from "@textlint/ast-node-types";
import { coreFlags, resetFlags } from "@textlint/feature-flag";

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
            let isStrCalled = false;
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
                        isStrCalled = true;
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
            return kernel.lintText("text", options).then((_result) => {
                assert.ok(isStrCalled);
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
            return kernel.lintText(text, options).then((_result) => {
                assert.strictEqual(getPreProcessArgs().text, text);
                assert.strictEqual(getPreProcessArgs().filePath, options.filePath);
            });
        });
        it("preProcess can return {text, ast} --fix", () => {
            const kernel = new TextlintKernel();
            const dummyText = "dummy text";
            const { plugin, getPreProcessArgs } = createBinaryPluginStub({
                dummyText
            });
            const options = {
                filePath: path.join(__dirname, "fixtures/binary/a.out"),
                ext: ".out",
                plugins: [{ pluginId: "example", plugin: plugin }],
                rules: [{ ruleId: "error", rule: errorRule }]
            };
            const text = "text";
            return kernel.fixText(text, options).then((_result) => {
                assert.strictEqual(getPreProcessArgs().text, dummyText);
                assert.strictEqual(getPreProcessArgs().filePath, options.filePath);
            });
        });
        it("preProcess can return Promise<{text, ast}>", () => {
            const kernel = new TextlintKernel();
            const { plugin, getPreProcessArgs } = createAsyncPluginStub();
            const options = {
                filePath: "/path/to/file.md",
                ext: ".md",
                plugins: [{ pluginId: "example", plugin: plugin }],
                rules: [{ ruleId: "error", rule: errorRule }]
            };
            const text = "text";
            return kernel.lintText(text, options).then((_result) => {
                assert.strictEqual(getPreProcessArgs().text, text);
                assert.strictEqual(getPreProcessArgs().filePath, options.filePath);
            });
        });
        it("preProcess can return Promise<{text, ast}> --fix", () => {
            const kernel = new TextlintKernel();
            const { plugin, getPreProcessArgs } = createAsyncPluginStub();
            const options = {
                filePath: "/path/to/file.md",
                ext: ".md",
                plugins: [{ pluginId: "example", plugin: plugin }],
                rules: [{ ruleId: "error", rule: errorRule }]
            };
            const text = "text";
            return kernel.fixText(text, options).then((_result) => {
                assert.strictEqual(getPreProcessArgs().text, text);
                assert.strictEqual(getPreProcessArgs().filePath, options.filePath);
            });
        });
        it("should throw error when preProcess invalid AST and runningTesting mode", () => {
            coreFlags.runningTester = true;
            const kernel = new TextlintKernel();

            class InvalidASTProcessor {
                availableExtensions() {
                    return [".out"];
                }

                processor() {
                    return {
                        preProcess() {
                            // THIS IS FOR TESTING
                            return {
                                invalid: "THIS IS NOT TxtAST"
                            } as any as TxtNode;
                        },
                        postProcess(messages: Array<any>, filePath?: string) {
                            return {
                                filePath: filePath ?? "<invalid>",
                                messages
                            };
                        }
                    };
                }
            }

            const InvalidPlugin: TextlintPluginCreator = {
                Processor: InvalidASTProcessor
            };
            const options: TextlintKernelOptions = {
                filePath: path.join(__dirname, "fixtures/binary/a.out"),
                ext: ".out",
                plugins: [
                    {
                        pluginId: "example",
                        plugin: InvalidPlugin
                    }
                ],
                rules: [{ ruleId: "error", rule: errorRule }]
            };
            return assert
                .rejects(() => {
                    return kernel.fixText("text", options);
                }, /invalid AST/)
                .finally(() => {
                    resetFlags();
                });
        });
    });
    describe("#postProcess", () => {
        it("postProcess should be called with messages and filePath", () => {
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
            return kernel.lintText(text, options).then((_result) => {
                assert.strictEqual(getPostProcessArgs().messages.length, options.rules[0].options.errors.length);
                assert.strictEqual(getPostProcessArgs().filePath, options.filePath);
            });
        });
    });
});
