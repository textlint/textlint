// LICENSE : MIT
"use strict";
import assert from "power-assert";
import RuleManager from "../src/rule/rule-manager";
describe("rule-manager", function () {
    describe("#importPlugin", function () {
        it("should define rules of plugin", function () {
            const ruleManager = new RuleManager();
            const pluginName = "configurable-plugin";
            const ruleName = "configurable-rule";
            const rules = require("./fixtures/plugins/configurable-plugin").rules;
            ruleManager.importPlugin(rules, pluginName);
            const definedRules = ruleManager.getAllRules();
            assert.equal(definedRules[`${pluginName}/${ruleName}`], rules[ruleName]);
        });
    });
});