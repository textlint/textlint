import * as assert from "assert";
import { createDummyPlugin } from "./helper/dummy-plugin";
import { TextlintKernelDescriptor } from "../../src/descriptor/index";
import exampleRule from "./helper/example-rule";

describe("TextlintrcDescriptor", () => {
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
});
