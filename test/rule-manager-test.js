// LICENSE : MIT
"use strict";
import assert from "power-assert";
import RuleManager from "../src/engine/rule-manager";
import RuleSet from "../src/engine/rule-set";
describe("rule-manager", function () {
    describe("#importPlugin", function () {
        it("should define rules of plugin", function () {
            const ruleSet = new RuleSet();
            const ruleManager = new RuleManager(ruleSet);
            const pluginName = "configurable-plugin";
            const ruleName = "configurable-rule";
            const rules = require("./fixtures/plugins/configurable-plugin").rules;
            ruleManager.importPlugin(rules, pluginName);
            const definedRules = ruleSet.getAllRules();
            assert.equal(definedRules[`${pluginName}/${ruleName}`], rules[ruleName]);
        });
    });
});
