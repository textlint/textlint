// LICENSE : MIT
"use strict";
const assert = require("assert");
import { TextlintRuleDescriptor } from "../../src/textlintrc-descriptor/TextlintRuleDescriptor";
import exampleRule from "./example-rule";
describe("RuleCreatorSet", function() {
    context("when passing undefined", function() {
        it("should return empty result", function() {
            const ruleCreatorSet = new TextlintRuleDescriptor();
            assert.deepEqual(ruleCreatorSet.rules, {});
            assert.deepEqual(ruleCreatorSet.ruleNames, []);
            assert.deepEqual(ruleCreatorSet.rulesConfig, {});
        });
    });
    context("when passing unavailable rule", function() {
        it("should return empty result", function() {
            const ruleCreatorSet = new TextlintRuleDescriptor({ rule: exampleRule }, { rule: false });
            assert.deepEqual(ruleCreatorSet.rules, {});
            assert.deepEqual(ruleCreatorSet.ruleNames, []);
            assert.deepEqual(ruleCreatorSet.rulesConfig, {});
        });
    });
    context("when passing available rule", function() {
        it("should return has result", function() {
            const ruleCreatorSet = new TextlintRuleDescriptor({ rule: exampleRule }, { rule: true });
            assert.deepEqual(ruleCreatorSet.rules, { rule: exampleRule });
            assert.deepEqual(ruleCreatorSet.ruleNames, ["rule"]);
            assert.deepEqual(ruleCreatorSet.rulesConfig, { rule: true });
        });
    });
    describe("#wihtouDuplicated", function() {
        it("should not filter duplicated only rule, config is difference", function() {
            const ruleCreatorSet = new TextlintRuleDescriptor(
                { ruleA: exampleRule, ruleB: exampleRule, ruleC: exampleRule },
                { ruleA: true, ruleB: { key: true }, ruleC: true }
            );
            assert.deepEqual(ruleCreatorSet.rules, {
                ruleA: exampleRule,
                ruleB: exampleRule,
                ruleC: exampleRule
            });
            assert.deepEqual(ruleCreatorSet.ruleNames, ["ruleA", "ruleB", "ruleC"]);
            assert.deepEqual(ruleCreatorSet.rulesConfig, { ruleA: true, ruleB: { key: true }, ruleC: true });

            const withoutDuplicatedRuleCreatorSet = ruleCreatorSet.withoutDuplicated();
            assert.deepEqual(withoutDuplicatedRuleCreatorSet.rules, { ruleA: exampleRule, ruleB: exampleRule });
            assert.deepEqual(withoutDuplicatedRuleCreatorSet.ruleNames, ["ruleA", "ruleB"]);
            assert.deepEqual(withoutDuplicatedRuleCreatorSet.rulesConfig, { ruleA: true, ruleB: { key: true } });
        });
        it("should filter duplicated rule and ruleConfig", function() {
            const ruleCreatorSet = new TextlintRuleDescriptor(
                { ruleA: exampleRule, ruleB: exampleRule },
                { ruleA: true, ruleB: true }
            );
            assert.deepEqual(ruleCreatorSet.rules, { ruleA: exampleRule, ruleB: exampleRule });
            assert.deepEqual(ruleCreatorSet.ruleNames, ["ruleA", "ruleB"]);
            assert.deepEqual(ruleCreatorSet.rulesConfig, { ruleA: true, ruleB: true });

            const withoutDuplicatedRuleCreatorSet = ruleCreatorSet.withoutDuplicated();
            assert.deepEqual(withoutDuplicatedRuleCreatorSet.rules, { ruleA: exampleRule });
            assert.deepEqual(withoutDuplicatedRuleCreatorSet.ruleNames, ["ruleA"]);
            assert.deepEqual(withoutDuplicatedRuleCreatorSet.rulesConfig, { ruleA: true });
        });
        // https://github.com/textlint/textlint/issues/231
        it("should not unexpected ignore testing", function() {
            const preset = require("textlint-rule-preset-ja-spacing");
            const ruleCreatorSet = new TextlintRuleDescriptor(preset.rules, preset.rulesConfig);
            const withoutDuplicatedRuleCreatorSet = ruleCreatorSet.withoutDuplicated();
            assert.deepEqual(ruleCreatorSet.rules, withoutDuplicatedRuleCreatorSet.rules);
            assert.deepEqual(ruleCreatorSet.rulesConfig, withoutDuplicatedRuleCreatorSet.rulesConfig);
        });
    });
});
