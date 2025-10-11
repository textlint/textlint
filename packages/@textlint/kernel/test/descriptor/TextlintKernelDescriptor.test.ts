import * as assert from "node:assert";
import { describe, it } from "vitest";
import { createDummyPlugin } from "./helper/dummy-plugin.js";
import { TextlintKernelDescriptor } from "../../src/descriptor/index.js";
import exampleRule from "./helper/example-rule.js";
import fixableExampleRule from "./helper/fixable-example-rule.js";
import { isTxtAST } from "@textlint/ast-tester";

describe("TextlintKernelDescriptor", () => {
    it("example code", () => {
        const descriptors = new TextlintKernelDescriptor({
            plugins: [
                {
                    pluginId: "text",
                    plugin: createDummyPlugin([".txt"])
                },
                {
                    pluginId: "markdown",
                    plugin: createDummyPlugin([".md"])
                }
            ],
            rules: [
                {
                    ruleId: "example",
                    rule: exampleRule
                }
            ],
            filterRules: []
        });
        // available extensions
        assert.deepStrictEqual(descriptors.plugin.availableExtensions, [".txt", ".md"]);
        // get plugin instance
        const markdownProcessor = descriptors.findPluginDescriptorWithExt(".md");
        assert.ok(markdownProcessor !== undefined);
        // rules
        assert.strictEqual(descriptors.rule.lintableDescriptors.length, 1);
    });
    it("parse text with plugin", async () => {
        const descriptors = new TextlintKernelDescriptor({
            plugins: [
                {
                    pluginId: "text",
                    plugin: createDummyPlugin([".txt"])
                },
                {
                    pluginId: "markdown",
                    plugin: createDummyPlugin([".md"])
                }
            ],
            rules: [
                {
                    ruleId: "example",
                    rule: exampleRule
                }
            ],
            filterRules: []
        });
        // available extensions
        assert.deepStrictEqual(descriptors.plugin.availableExtensions, [".txt", ".md"]);
        // get plugin instance
        const markdownProcessor = descriptors.findPluginDescriptorWithExt(".md");
        assert.ok(markdownProcessor !== undefined);
        const markdownPlugin = markdownProcessor.processor.processor(".md");
        const result = await markdownPlugin.preProcess("# Hello World");
        assert.ok(isTxtAST(result));
        assert.strictEqual(result.type, "Document");
    });
    describe("#shallowMerge", () => {
        it("should merge partial arguments", () => {
            const descriptors = new TextlintKernelDescriptor({
                plugins: [
                    {
                        pluginId: "markdown",
                        plugin: createDummyPlugin([".md"])
                    }
                ],
                rules: [
                    {
                        ruleId: "lintable",
                        rule: exampleRule
                    }
                ],
                filterRules: []
            });
            // available extensions
            assert.deepStrictEqual(descriptors.plugin.availableExtensions, [".md"]);
            assert.deepStrictEqual(
                descriptors.rule.descriptors.map((rule) => rule.id),
                ["lintable"]
            );
            const mergedDescriptors = descriptors.shallowMerge({
                plugins: [
                    {
                        pluginId: "text",
                        plugin: createDummyPlugin([".txt"])
                    }
                ],
                rules: [
                    {
                        ruleId: "fixable",
                        rule: fixableExampleRule
                    }
                ]
            });
            assert.deepStrictEqual(mergedDescriptors.plugin.availableExtensions, [".txt"]);
            assert.deepStrictEqual(
                mergedDescriptors.rule.descriptors.map((rule) => rule.id),
                ["fixable"]
            );
        });
    });
    describe("#concat", () => {
        it("should concat descriptor", () => {
            const descriptorA = new TextlintKernelDescriptor({
                configBaseDir: "/path/a/.textlintrc.json",
                plugins: [
                    {
                        pluginId: "markdownA",
                        plugin: createDummyPlugin([".md"]),
                        options: true
                    }
                ],
                rules: [
                    {
                        ruleId: "lintable",
                        rule: exampleRule,
                        options: false
                    }
                ],
                filterRules: []
            });
            const descriptorB = new TextlintKernelDescriptor({
                configBaseDir: "/path/b/.textlintrc.json",
                plugins: [
                    {
                        pluginId: "markdownB",
                        plugin: createDummyPlugin([".md"]),
                        options: true
                    }
                ],
                rules: [
                    {
                        ruleId: "lintable",
                        rule: exampleRule,
                        options: true
                    }
                ],
                filterRules: []
            });

            // available extensions
            const newDescriptor = descriptorA.concat(descriptorB);
            assert.deepStrictEqual(newDescriptor.toJSON(), {
                configBaseDir: "/path/b/.textlintrc.json",
                filterRule: [],
                plugin: [
                    {
                        id: "markdownA",
                        options: {}
                    },
                    {
                        id: "markdownB",
                        options: {}
                    }
                ],
                rule: [
                    {
                        id: "lintable",
                        options: {}
                    }
                ]
            });
        });
    });
});
