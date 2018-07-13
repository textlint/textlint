// LICENSE : MIT
"use strict";
import * as assert from "assert";
import { TextlintPluginDescriptors } from "../../src";
import { createTextlintPluginDescriptors } from "../../src/DescriptorsFactory";
import { TextlintPluginCreator } from "@textlint/kernel";
import { TextlintPluginDescriptor } from "../../src/TextlintPluginDescriptor";

const createDummyPlugin = (extensions: string[] = [".dummy"]) => {
    const DummyPlugin: TextlintPluginCreator = {
        Processor: class DummyProcessor {
            availableExtensions() {
                return extensions;
            }

            processor() {
                return {
                    preProcess(_: string) {
                        return {} as any;
                    },
                    postProcess(_messages: Array<any>, _filePath?: string) {
                        return {} as any;
                    }
                };
            }
        }
    };
    return DummyPlugin;
};
describe("TextlintRuleDescriptors", function() {
    context("when passing undefined", function() {
        it("should return empty result", function() {
            const pluginDescriptors = new TextlintPluginDescriptors();
            assert.deepStrictEqual(pluginDescriptors.descriptors, []);
            assert.deepStrictEqual(pluginDescriptors.allDescriptors, []);
        });
    });
    context("when passing unavailable rule", function() {
        it("should return empty result", function() {
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
    describe("#wihtouDuplicated", function() {
        it("should filter duplicated rule and ruleConfig", function() {
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
    describe("#find", function() {
        it("should return a descriptor that match forward with extension", function() {
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
