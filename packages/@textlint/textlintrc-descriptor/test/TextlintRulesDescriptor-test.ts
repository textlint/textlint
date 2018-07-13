// LICENSE : MIT
"use strict";
import * as assert from "assert";
import { TextlintRuleDescriptors } from "../src/index";
import exampleRule from "./helper/example-rule";
import {
    TextlintKernelPlugin,
    TextlintKernelRule,
    TextlintPluginCreator,
    TextlintPluginOptions,
    TextlintRuleCreator,
    TextlintRuleOptions
} from "@textlint/kernel";
import { createTextlintRuleDescriptors } from "../src/DescriptorsFactory";
import { TextlintRuleDescriptor } from "../src/TextlintRuleDescriptor";
import { TextlintFilterRuleCreator, TextlintFilterRuleOptions, TextlintKernelFilterRule } from "../../kernel/src/index";

/**
 * Convert rulesObject to TextlintKernelRule
 * {
 *     "rule-name": rule
 * },
 * {
 *     "rule-name": ruleOption
 * }
 *
 * => TextlintKernelRule
 */
export const rulesObjectToKernelRule = (
    rules: { [index: string]: TextlintRuleCreator },
    rulesOption: { [index: string]: TextlintRuleOptions }
): TextlintKernelRule[] => {
    return Object.keys(rules).map(ruleId => {
        return {
            ruleId,
            rule: rules[ruleId],
            options: rulesOption[ruleId]
        };
    });
};

export const filterRulesObjectToKernelRule = (
    rules: { [index: string]: TextlintFilterRuleCreator },
    rulesOption: { [index: string]: TextlintFilterRuleOptions }
): TextlintKernelFilterRule[] => {
    return Object.keys(rules).map(ruleId => {
        return {
            ruleId,
            rule: rules[ruleId],
            options: rulesOption[ruleId]
        };
    });
};

/**
 * Convert pluginsObject to TextlintKernelPlugin
 * {
 *     "plugin-name": plugin
 * },
 * {
 *     "plugin-name": pluginOption
 * }
 *
 * => TextlintKernelPlugin
 */
export const pluginsObjectToKernelRule = (
    plugins: { [index: string]: TextlintPluginCreator },
    pluginsOption: { [index: string]: TextlintPluginOptions }
): TextlintKernelPlugin[] => {
    return Object.keys(plugins).map(pluginId => {
        return {
            pluginId,
            plugin: plugins[pluginId],
            options: pluginsOption[pluginId]
        };
    });
};

describe("TextlintRuleDescriptors", function() {
    context("when passing undefined", function() {
        it("should return empty result", function() {
            const ruleCreatorSet = new TextlintRuleDescriptors();
            assert.deepStrictEqual(ruleCreatorSet.descriptors, []);
            assert.deepStrictEqual(ruleCreatorSet.allDescriptors, []);
        });
    });
    context("when passing unavailable rule", function() {
        it("should return empty result", function() {
            const ruleDescriptors = createTextlintRuleDescriptors(
                rulesObjectToKernelRule({ rule: exampleRule }, { rule: false })
            );
            assert.deepStrictEqual(ruleDescriptors.descriptors, []);
        });
    });
    context("when passing available rule", function() {
        it("should return has result", function() {
            const rules = rulesObjectToKernelRule({ rule: exampleRule }, { rule: true });
            const descriptors = rules.map(rule => new TextlintRuleDescriptor(rule));
            const ruleCreatorSet = new TextlintRuleDescriptors(descriptors);
            assert.strictEqual(ruleCreatorSet.descriptors.length, 1);
            assert.strictEqual(ruleCreatorSet.descriptors[0], descriptors[0]);
        });
    });
    describe("#wihtouDuplicated", function() {
        it("should not filter duplicated only rule, config is difference", function() {
            const ruleDescriptors = createTextlintRuleDescriptors(
                rulesObjectToKernelRule(
                    { ruleA: exampleRule, ruleB: exampleRule, ruleC: exampleRule },
                    { ruleA: true, ruleB: { key: true }, ruleC: true }
                )
            );
            assert.strictEqual(ruleDescriptors.descriptors.length, 3);
            const withoutDuplicatedRuleCreatorSet = ruleDescriptors.withoutDuplicated();
            assert.deepStrictEqual(withoutDuplicatedRuleCreatorSet.descriptors.length, 2);
        });
        it("should filter duplicated rule and ruleConfig", function() {
            const descriptorA = new TextlintRuleDescriptor({
                ruleId: "ruleA",
                rule: exampleRule,
                options: true
            });
            const descriptorB = new TextlintRuleDescriptor({
                ruleId: "ruleB",
                rule: exampleRule,
                options: true
            });
            const ruleDescriptors = new TextlintRuleDescriptors([descriptorA, descriptorB]);
            assert.deepStrictEqual(ruleDescriptors.descriptors, [descriptorA, descriptorB]);
            const withoutDuplicatedRuleCreatorSet = ruleDescriptors.withoutDuplicated();
            // save first item
            assert.deepStrictEqual(withoutDuplicatedRuleCreatorSet.descriptors, [descriptorA]);
        });
        // https://github.com/textlint/textlint/issues/231
        it("should not unexpected ignore testing", function() {
            const preset = require("textlint-rule-preset-ja-spacing");
            const ruleCreatorSet = createTextlintRuleDescriptors(
                rulesObjectToKernelRule(preset.rules, preset.rulesConfig)
            );
            const withoutDuplicatedRuleCreatorSet = ruleCreatorSet.withoutDuplicated();
            assert.deepStrictEqual(ruleCreatorSet.descriptors, withoutDuplicatedRuleCreatorSet.descriptors);
        });
    });
});
