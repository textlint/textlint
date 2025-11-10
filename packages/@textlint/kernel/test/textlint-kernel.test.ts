// MIT © 2017 azu
"use strict";
import type { TextlintMessage } from "@textlint/types";
import { describe, it } from "vitest";
import { TextlintKernel } from "../src/textlint-kernel.js";
import { errorRule } from "./helper/ErrorRule.js";
import { suggestionRule } from "./helper/SuggestionRule.js";
import { createPluginStub, ExampleProcessorOptions } from "./helper/ExamplePlugin.js";
import { TextlintKernelOptions } from "../src/textlint-kernel-interface.js";
import { filterRule } from "./helper/FilterRule.js";
import { TextlintRuleSeverityLevelKeys } from "../src/context/TextlintRuleSeverityLevelKeys.js";

import assert from "node:assert";

/**
 * assert: TextlintMessage must have these properties
 */
const assertMessage = (message: TextlintMessage) => {
    assert.strictEqual(typeof message.type, "string");
    assert.strictEqual(typeof message.ruleId, "string");
    assert.strictEqual(typeof message.message, "string");
    assert.strictEqual(typeof message.index, "number");
    assert.strictEqual(typeof message.line, "number");
    assert.strictEqual(typeof message.column, "number");
    assert.ok(
        TextlintRuleSeverityLevelKeys.info === message.severity ||
            message.severity === TextlintRuleSeverityLevelKeys.warning ||
            message.severity === TextlintRuleSeverityLevelKeys.error
    );
};

describe("textlint-kernel", () => {
    describe("#lintText", () => {
        it("should return messages", () => {
            const kernel = new TextlintKernel();
            const { plugin } = createPluginStub({
                extensions: [".md"]
            });
            const options = {
                filePath: "/path/to/file.md",
                ext: ".md",
                plugins: [{ pluginId: "markdown", plugin }],
                rules: [
                    {
                        ruleId: "error",
                        rule: errorRule,
                        options: { errors: [{ message: "error message", range: [0, 1] }] }
                    }
                ]
            };
            return kernel.lintText("text", options).then((result) => {
                assert.strictEqual(result.filePath, options.filePath);
                assert.strictEqual(result.messages.length, 1);
                result.messages.forEach((message) => assertMessage(message));
            });
        });
        describe("when rule has fixer", () => {
            it("should return messages that has `fix` object", () => {
                const kernel = new TextlintKernel();
                const expectedFixObject = {
                    range: [0, 5],
                    text: "fixed"
                };
                const { plugin } = createPluginStub();
                const options = {
                    filePath: "/path/to/file.md",
                    ext: ".md",
                    plugins: [{ pluginId: "markdown", plugin }],
                    rules: [
                        {
                            ruleId: "error",
                            rule: errorRule,
                            options: {
                                errors: [
                                    {
                                        message: "error message",
                                        range: expectedFixObject.range,
                                        output: expectedFixObject.text
                                    }
                                ]
                            }
                        }
                    ]
                };
                return kernel.lintText("test text", options).then((result) => {
                    assert.strictEqual(result.filePath, options.filePath);
                    assert.strictEqual(result.messages.length, 1);
                    const [message] = result.messages;
                    assertMessage(message);
                    if (typeof message.fix !== "object") {
                        throw new Error("Not found `fix` object");
                    }
                    assert.deepStrictEqual(message.fix, expectedFixObject);
                });
            });
        });
        describe("when rule has suggestions", () => {
            it("should return messages that has `suggestions` array", () => {
                const kernel = new TextlintKernel();
                const { plugin } = createPluginStub({
                    extensions: [".md"]
                });
                const options = {
                    filePath: "/path/to/file.md",
                    ext: ".md",
                    plugins: [{ pluginId: "markdown", plugin }],
                    rules: [
                        {
                            ruleId: "suggestion-rule",
                            rule: suggestionRule
                        }
                    ]
                };
                return kernel.lintText("text", options).then((result) => {
                    assert.strictEqual(result.filePath, options.filePath);
                    assert.strictEqual(result.messages.length, 1);
                    const [message] = result.messages;
                    assertMessage(message);
                    assert.ok(Array.isArray(message.suggestions), "suggestions should be an array");
                    assert.strictEqual(message.suggestions.length, 2);

                    const s1 = message.suggestions[0];
                    assert.strictEqual(s1.id, "suggestion-1");
                    assert.strictEqual(s1.message, "use alternative");
                    assert.ok(s1.fix);
                    assert.strictEqual(s1.fix.text, "X");
                    assert.deepStrictEqual(s1.fix.range, [0, 1]);

                    const s2 = message.suggestions[1];
                    assert.strictEqual(s2.id, "suggestion-2");
                    assert.strictEqual(s2.message, "use another");
                    assert.ok(s2.fix);
                    assert.strictEqual(s2.fix.text, "Y");
                    assert.deepStrictEqual(s2.fix.range, [0, 1]);
                });
            });
        });
        it("should pass pluginOptions to plugin", () => {
            const kernel = new TextlintKernel();
            const { getOptions, plugin } = createPluginStub();
            const expectedPluginOptions: ExampleProcessorOptions = { testOption: "test" };
            const options = {
                filePath: "/path/to/file.md",
                ext: ".md",
                plugins: [{ pluginId: "example", plugin, options: expectedPluginOptions }],
                rules: [{ ruleId: "error", rule: errorRule }]
            };
            return kernel.lintText("text", options as unknown as TextlintKernelOptions).then((_result) => {
                const actualPluginOptions = getOptions();
                assert.deepEqual(actualPluginOptions, expectedPluginOptions);
            });
        });
        it("should pass severity to ruleOption", () => {
            const kernel = new TextlintKernel();
            const { plugin } = createPluginStub();
            const options = {
                filePath: "/path/to/file.md",
                ext: ".md",
                plugins: [{ pluginId: "example", plugin }],
                rules: [
                    {
                        ruleId: "warning",
                        rule: errorRule,
                        options: {
                            errors: [
                                {
                                    message: "warning message",
                                    range: [5, 6]
                                }
                            ],
                            severity: "warning"
                        } as const
                    },
                    {
                        ruleId: "error",
                        rule: errorRule,
                        options: {
                            errors: [
                                {
                                    message: "error message",
                                    range: [8, 9]
                                }
                            ],
                            severity: "error"
                        } as const
                    }
                ]
            };
            return kernel.lintText("text", options).then((result) => {
                const warningMessage = result.messages.find((message) => message.ruleId === "warning")!;
                assertMessage(warningMessage);
                assert.strictEqual(warningMessage.severity, TextlintRuleSeverityLevelKeys.warning);

                const errorMessage = result.messages.find((message) => message.ruleId === "error")!;
                assertMessage(errorMessage);
                assert.strictEqual(errorMessage.severity, TextlintRuleSeverityLevelKeys.error);
            });
        });
        describe("when rule error is match ignoredRange and ruleId", () => {
            it("should not report these error", () => {
                const kernel = new TextlintKernel();
                const { plugin } = createPluginStub();
                const errorRange = [5, 6];
                const ignoreRange = [0, 6];
                const options: TextlintKernelOptions = {
                    filePath: "/path/to/file.md",
                    ext: ".md",
                    plugins: [{ pluginId: "markdown", plugin }],
                    rules: [
                        {
                            ruleId: "error-id",
                            rule: errorRule,
                            options: {
                                errors: [
                                    {
                                        message: "error message",
                                        range: errorRange
                                    }
                                ]
                            }
                        }
                    ],
                    filterRules: [
                        {
                            ruleId: "filter",
                            rule: filterRule,
                            options: {
                                allows: [
                                    {
                                        range: ignoreRange,
                                        ruleId: "error-id"
                                    }
                                ]
                            }
                        }
                    ]
                };
                return kernel.lintText("text", options).then((results) => {
                    assert.strictEqual(results.messages.length, 0);
                });
            });
            it("ignoreRuleId should be normalized", () => {
                const kernel = new TextlintKernel();
                const { plugin } = createPluginStub();
                const errorRange = [4, 5];
                const ignoreRange = [0, 5];
                const options: TextlintKernelOptions = {
                    filePath: "/path/to/file.md",
                    ext: ".md",
                    plugins: [{ pluginId: "markdown", plugin }],
                    rules: [
                        {
                            ruleId: "error-id",
                            rule: errorRule,
                            options: {
                                errors: [
                                    {
                                        message: "error message",
                                        range: errorRange
                                    }
                                ]
                            }
                        }
                    ],
                    filterRules: [
                        {
                            ruleId: "filter",
                            rule: filterRule,
                            options: {
                                allows: [
                                    {
                                        range: ignoreRange,
                                        ruleId: "textlint-rule-error-id" // <= normalized to "error-id"
                                    }
                                ]
                            }
                        }
                    ]
                };
                return kernel.lintText("text", options).then((results) => {
                    assert.strictEqual(results.messages.length, 0);
                });
            });
        });
        describe("when rule error is match ignoredRange", () => {
            it("should not report these error", () => {
                const kernel = new TextlintKernel();
                const { plugin } = createPluginStub();
                const errorRange = [4, 5];
                const ignoreRange = [0, 5];
                const options: TextlintKernelOptions = {
                    filePath: "/path/to/file.md",
                    ext: ".md",
                    plugins: [{ pluginId: "markdown", plugin }],
                    rules: [
                        {
                            ruleId: "error",
                            rule: errorRule,
                            options: {
                                errors: [
                                    {
                                        message: "error message",
                                        range: errorRange
                                    }
                                ]
                            }
                        }
                    ],
                    filterRules: [
                        {
                            ruleId: "filter",
                            rule: filterRule,
                            options: {
                                allows: [
                                    {
                                        range: ignoreRange
                                    }
                                ]
                            }
                        }
                    ]
                };

                return kernel.lintText("text", options).then((results) => {
                    assert.strictEqual(results.messages.length, 0);
                });
            });
        });
        describe("when pass invalid options", () => {
            it("should throw validation error", () => {
                const kernel = new TextlintKernel({});
                return kernel
                    .lintText("text", { ext: "test", plugins: [{ pluginId: 1 }] } as unknown as TextlintKernelOptions)
                    .catch((error) => {
                        assert.ok(error instanceof Error);
                    });
            });
        });
    });
    describe("#fixText", () => {
        it("should return messages", () => {
            const kernel = new TextlintKernel();
            const { plugin } = createPluginStub();
            const options = {
                filePath: "/path/to/file.md",
                ext: ".md",
                plugins: [{ pluginId: "markdown", plugin }],
                rules: [
                    {
                        ruleId: "error",
                        rule: errorRule,
                        options: { errors: [{ message: "error message", range: [0, 1] }] }
                    }
                ]
            };
            return kernel.fixText("text", options).then((result) => {
                assert.strictEqual(typeof result.filePath, "string");
                assert.strictEqual(result.messages.length, 1);
                result.messages.forEach((message) => assertMessage(message));
            });
        });
        it("should pass pluginOptions to plugin", () => {
            const kernel = new TextlintKernel();
            const { getOptions, plugin } = createPluginStub();
            const expectedPluginOptions: ExampleProcessorOptions = { testOption: "test" };
            const options = {
                filePath: "/path/to/file.md",
                ext: ".md",
                plugins: [{ pluginId: "example", plugin, options: expectedPluginOptions }],
                rules: [{ ruleId: "error", rule: errorRule }]
            };
            return kernel.lintText("text", options as unknown as TextlintKernelOptions).then((_result) => {
                const actualPluginOptions = getOptions();
                assert.deepEqual(actualPluginOptions, expectedPluginOptions);
            });
        });
        describe("when pass invalid options", () => {
            it("should throw validation error", () => {
                const kernel = new TextlintKernel({});
                return kernel
                    .fixText("text", { ext: "test", plugins: [{ pluginId: 1 }] } as unknown as TextlintKernelOptions)
                    .catch((error) => {
                        assert.ok(error instanceof Error);
                    });
            });
        });
    });
});
