// LICENSE : MIT
"use strict";
import { TextLintModuleMapper } from "../../src/engine/textlint-module-mapper";
import configurablePlugin from "./fixtures/configurable-plugin";
import configurableRule from "./fixtures/configurable-plugin/rules/configurable-rule";
const assert = require("assert");
describe("textlint-module-mapper-test", function () {
    describe("#createRuleEntities", function () {
        it("should create [prefix/key, ruleCreator] entity form rules", function () {
            const ruleA = () => {};
            const ruleB = () => {};
            const map = TextLintModuleMapper.createEntities({ ruleA, ruleB }, "prefix");
            assert.deepEqual(map, [
                ["prefix/ruleA", ruleA],
                ["prefix/ruleB", ruleB]
            ]);
        });
        it("should create [prefix/key, option] entity from rulesConfig", function () {
            const ruleAOption = { key: "value" };
            const map = TextLintModuleMapper.createEntities({ ruleA: ruleAOption, ruleB: true }, "prefix");
            assert.deepEqual(map, [
                ["prefix/ruleA", ruleAOption],
                ["prefix/ruleB", true]
            ]);
        });
        it("should define rules of plugin", function () {
            const pluginName = "configurable-plugin";
            const rules = configurablePlugin.rules;
            const entities = TextLintModuleMapper.createEntities(rules, pluginName);
            assert.deepEqual(entities, [
                [`${pluginName}/configurable-rule`, configurableRule],
                [`${pluginName}/overwrited-rule`, configurableRule]
            ]);
        });
    });
    describe("#createRuleConfigEntities", function () {
        it("should create { 'prefix/key' : ruleCreator } map form rules", function () {
            const ruleA = () => {};
            const ruleB = () => {};
            const map = TextLintModuleMapper.createMappedObject({ ruleA, ruleB }, "prefix");
            assert.deepEqual(map, { "prefix/ruleA": ruleA, "prefix/ruleB": ruleB });
        });
        it("should create { 'prefix/key' : ruleOption } map from rulesConfig", function () {
            const ruleAOption = { key: "value" };
            const map = TextLintModuleMapper.createMappedObject({ ruleA: ruleAOption, ruleB: false }, "prefix");
            assert.deepEqual(map, { "prefix/ruleA": ruleAOption, "prefix/ruleB": false });
        });
    });
});
