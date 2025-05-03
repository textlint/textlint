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
    describe("#equals", function () {
        it("should return true if descriptors are same", function () {
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
            assert.ok(descriptorA.equals(descriptorB));
        });
        it("should return false if descriptors are not same", function () {
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
                    opt: { key: true, key2: "diff" }
                }
            });
            assert.ok(!descriptorA.equals(descriptorB));
        });
        it("should return false if descriptors option type is different", function () {
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
                    opt: { key: 1 } // diff
                }
            });
            assert.ok(!descriptorA.equals(descriptorB));
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
        it("should return the first descriptor that matches the single extension", function () {
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
        it("should return the first descriptor that matches the multi-part extension", function () {
            const phpDescriptor = new TextlintPluginDescriptor({
                pluginId: "HtmlPlugin",
                plugin: createDummyPlugin([".php"]),
                options: true
            });
            const phpDescriptors = new TextlintPluginDescriptors([phpDescriptor]);
            // `.foo.php` should be matched
            const fooPhpPlugin = phpDescriptors.findPluginDescriptorWithExt(".foo.php");
            assert.strictEqual(fooPhpPlugin, phpDescriptor);
            // `.php.foo` should not be matched
            const phpFooPlugin = phpDescriptors.findPluginDescriptorWithExt(".php.foo");
            assert.strictEqual(phpFooPlugin, undefined);

            const bladePhpDescriptor = new TextlintPluginDescriptor({
                pluginId: "HtmlPlugin",
                plugin: createDummyPlugin([".blade.php"]),
                options: true
            });
            const bladePhpDescriptors = new TextlintPluginDescriptors([bladePhpDescriptor]);
            // `.blade.php` should be matched
            const bladePhpPlugin = bladePhpDescriptors.findPluginDescriptorWithExt(".blade.php");
            assert.strictEqual(bladePhpPlugin, bladePhpDescriptor);
            // `.php` should not be matched
            const phpPlugin = bladePhpDescriptors.findPluginDescriptorWithExt(".php");
            assert.strictEqual(phpPlugin, undefined);
        });
    });
});
