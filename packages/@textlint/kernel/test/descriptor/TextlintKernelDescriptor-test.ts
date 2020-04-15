import * as assert from "assert";
import { createDummyPlugin } from "./helper/dummy-plugin";
import { TextlintKernelDescriptor } from "../../src/descriptor/index";
import exampleRule from "./helper/example-rule";
import fixableExampleRule from "./helper/fixable-example-rule";

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
});
