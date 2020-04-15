// LICENSE : MIT
"use strict";
import * as assert from "assert";
import { TextlintPluginDescriptors } from "../../src/descriptor/index";
import { createTextlintPluginDescriptors } from "../../src/descriptor/DescriptorsFactory";
import { TextlintPluginDescriptor } from "../../src/descriptor/TextlintPluginDescriptor";
import { createDummyPlugin } from "./helper/dummy-plugin";

describe("TextlintRuleDescriptors", function () {
    context("when passing undefined", function () {
        it("should return empty result", function () {
            const pluginDescriptors = new TextlintPluginDescriptors();
            assert.deepStrictEqual(pluginDescriptors.descriptors, []);
            assert.deepStrictEqual(pluginDescriptors.allDescriptors, []);
        });
    });
    context("when passing unavailable rule", function () {
        it("should return empty result", function () {
            const ruleDescriptors = createTextlintPluginDescriptors([
                {
                    pluginId: "plugin",
                    plugin: createDummyPlugin(),
                    options: false
                }
            ]);
            assert.deepStrictEqual(ruleDescriptors.descriptors, []);
        });
    });
    describe("#wihtouDuplicated", function () {
        it("should filter duplicated rule and ruleConfig", function () {
            // same instance
            const dummyPlugin = createDummyPlugin();
            const descriptorA = new TextlintPluginDescriptor({
                pluginId: "pluginA",
                plugin: dummyPlugin,
                options: {
                    opt: { key: true }
                }
            });
            const descriptorB = new TextlintPluginDescriptor({
                pluginId: "pluginB",
                plugin: dummyPlugin,
                options: {
                    opt: { key: true }
                }
            });
            const ruleDescriptors = new TextlintPluginDescriptors([descriptorA, descriptorB]);
            assert.deepStrictEqual(ruleDescriptors.descriptors, [descriptorA, descriptorB]);
            const withoutDuplicatedRuleCreatorSet = ruleDescriptors.withoutDuplicated();
            // save first item
            assert.deepStrictEqual(withoutDuplicatedRuleCreatorSet.descriptors, [descriptorA]);
        });
    });
    describe("#findPluginDescriptorWithExt", function () {
        it("should return a descriptor that match forward with extension", function () {
            const descriptorA = new TextlintPluginDescriptor({
                pluginId: "TextPlugin",
                plugin: createDummyPlugin([".txt"]),
                options: true
            });
            const descriptorB = new TextlintPluginDescriptor({
                pluginId: "MarkdownPlugin",
                plugin: createDummyPlugin([".md"]),
                options: true
            });
            const descriptorC = new TextlintPluginDescriptor({
                pluginId: "AltTextPlugin",
                plugin: createDummyPlugin([".txt"]),
                options: true
            });
            const ruleDescriptors = new TextlintPluginDescriptors([descriptorA, descriptorB, descriptorC]);
            assert.deepStrictEqual(ruleDescriptors.descriptors, [descriptorA, descriptorB, descriptorC]);
            const textPlugin = ruleDescriptors.findPluginDescriptorWithExt(".txt");
            // save first item
            assert.deepStrictEqual(textPlugin, descriptorA);
        });
    });
});
