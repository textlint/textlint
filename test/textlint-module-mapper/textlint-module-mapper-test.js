// LICENSE : MIT
"use strict";
import Mapper from "../../src/engine/textlint-module-mapper";
const assert = require("power-assert");
describe("textlint-module-mapper-test", function () {
    describe("#createRuleEntities", function () {
        it("should create [prefix/key, ruleCreator] entity form rules", function () {
            const ruleA = () => {
            };
            const ruleB = () => {
            };
            const map = Mapper.createEntities({
                "ruleA": ruleA,
                "ruleB": ruleB
            }, "prefix");
            assert.deepEqual(map, [
                ["prefix/ruleA", ruleA],
                ["prefix/ruleB", ruleB]
            ]);
        });
        it("should create [prefix/key, option] entity from rulesConfig", function () {
            const ruleAOption = {
                "key": "value"
            };
            const map = Mapper.createEntities({
                "ruleA": ruleAOption,
                "ruleB": true
            }, "prefix");
            assert.deepEqual(map, [
                ["prefix/ruleA", ruleAOption],
                ["prefix/ruleB", true]
            ]);
        });
        it("should define rules of plugin", function () {
            const pluginName = "configurable-plugin";
            const rules = require("./fixtures/configurable-plugin/index").rules;
            const entities = Mapper.createEntities(rules, pluginName);
            assert.deepEqual(entities, [
                [`${pluginName}/configurable-rule`, require("./fixtures/configurable-plugin/rules/configurable-rule")],
                [`${pluginName}/overwrited-rule`, require("./fixtures/configurable-plugin/rules/configurable-rule")]
            ]);
        });
    });
    describe("#createRuleConfigEntities", function () {
        it("should create { 'prefix/key' : ruleCreator } map form rules", function () {
            const ruleA = () => {
            };
            const ruleB = () => {
            };
            const map = Mapper.createMappedObject({
                "ruleA": ruleA,
                "ruleB": ruleB
            }, "prefix");
            assert.deepEqual(map, {
                "prefix/ruleA": ruleA,
                "prefix/ruleB": ruleB
            });
        });
        it("should create { 'prefix/key' : ruleOption } map from rulesConfig", function () {
            const ruleAOption = {
                "key": "value"
            };
            const map = Mapper.createMappedObject({
                "ruleA": ruleAOption,
                "ruleB": false
            }, "prefix");
            assert.deepEqual(map, {
                "prefix/ruleA": ruleAOption,
                "prefix/ruleB": false
            });
        });
    });
});
