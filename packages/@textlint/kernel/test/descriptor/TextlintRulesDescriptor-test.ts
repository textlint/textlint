// LICENSE : MIT
"use strict";
import * as assert from "assert";
import { TextlintRuleDescriptors } from "../../src/descriptor/index";
import exampleRule from "./helper/example-rule";
import fixableExampleRule from "./helper/fixable-example-rule";
import {
    TextlintKernelPlugin,
    TextlintKernelRule,
    TextlintPluginCreator,
    TextlintPluginOptions,
    TextlintRuleModule
} from "@textlint/kernel";
import { createTextlintRuleDescriptors } from "../../src/descriptor/DescriptorsFactory";
import { TextlintLintableRuleDescriptor } from "../../src/descriptor/TextlintLintableRuleDescriptor";
import { TextlintFilterRuleReporter, TextlintKernelFilterRule } from "../../src/index";

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
    rules: { [index: string]: TextlintRuleModule },
    rulesOption: { [index: string]: TextlintKernelRule["options"] }
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
    rules: { [index: string]: TextlintFilterRuleReporter },
    rulesOption: { [index: string]: TextlintKernelFilterRule["options"] }
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
            assert.deepStrictEqual(ruleCreatorSet.lintableDescriptors, []);
            assert.deepStrictEqual(ruleCreatorSet.allDescriptors, []);
        });
    });
    context("when passing unavailable rule", function() {
        it("should return empty result", function() {
            const ruleDescriptors = createTextlintRuleDescriptors(
                rulesObjectToKernelRule({ rule: exampleRule }, { rule: false })
            );
            assert.deepStrictEqual(ruleDescriptors.lintableDescriptors, []);
        });
    });
    context("when passing available rule", function() {
        it("should return has result", function() {
            const rules = rulesObjectToKernelRule({ rule: exampleRule }, { rule: true });
            const descriptors = rules.map(rule => new TextlintLintableRuleDescriptor(rule));
            const ruleCreatorSet = new TextlintRuleDescriptors(descriptors);
            assert.strictEqual(ruleCreatorSet.lintableDescriptors.length, 1);
            assert.strictEqual(ruleCreatorSet.lintableDescriptors[0], descriptors[0]);
        });
    });
    context("when mixed linter and fixable rule", function() {
        it("can create ruleDescriptors from these", function() {
            const ruleDescriptors = createTextlintRuleDescriptors([
                {
                    ruleId: "linter",
                    rule: exampleRule
                },
                {
                    ruleId: "fixer",
                    rule: fixableExampleRule
                }
            ]);
            assert.strictEqual(ruleDescriptors.lintableDescriptors.length, 2);
        });
        it("should return linter or fixer", function() {
            const ruleDescriptors = createTextlintRuleDescriptors([
                {
                    ruleId: "linter",
                    rule: exampleRule
                },
                {
                    ruleId: "fixer",
                    rule: fixableExampleRule
                }
            ]);
            assert.strictEqual(ruleDescriptors.lintableDescriptors.length, 2);
            assert.deepStrictEqual(
                [ruleDescriptors.lintableDescriptors[0].id, ruleDescriptors.lintableDescriptors[1].id],
                ["linter", "fixer"]
            );
            assert.strictEqual(ruleDescriptors.fixableDescriptors.length, 1);
            assert.strictEqual(ruleDescriptors.fixableDescriptors[0].id, "fixer");
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
            assert.strictEqual(ruleDescriptors.lintableDescriptors.length, 3);
            const withoutDuplicatedRuleCreatorSet = ruleDescriptors.withoutDuplicated();
            assert.deepStrictEqual(withoutDuplicatedRuleCreatorSet.lintableDescriptors.length, 2);
        });
        it("should filter duplicated rule and ruleConfig", function() {
            const descriptorA = new TextlintLintableRuleDescriptor({
                ruleId: "ruleA",
                rule: exampleRule,
                options: true
            });
            const descriptorB = new TextlintLintableRuleDescriptor({
                ruleId: "ruleB",
                rule: exampleRule,
                options: true
            });
            const ruleDescriptors = new TextlintRuleDescriptors([descriptorA, descriptorB]);
            assert.deepStrictEqual(ruleDescriptors.lintableDescriptors, [descriptorA, descriptorB]);
            const withoutDuplicatedRuleCreatorSet = ruleDescriptors.withoutDuplicated();
            // save first item
            assert.deepStrictEqual(withoutDuplicatedRuleCreatorSet.lintableDescriptors, [descriptorA]);
        });
        // https://github.com/textlint/textlint/issues/231
        it("should not unexpected ignore testing", function() {
            const preset = require("textlint-rule-preset-ja-spacing");
            const ruleCreatorSet = createTextlintRuleDescriptors(
                rulesObjectToKernelRule(preset.rules, preset.rulesConfig)
            );
            const withoutDuplicatedRuleCreatorSet = ruleCreatorSet.withoutDuplicated();
            assert.deepStrictEqual(
                ruleCreatorSet.lintableDescriptors,
                withoutDuplicatedRuleCreatorSet.lintableDescriptors
            );
        });
    });
});
