// LICENSE : MIT
"use strict";
const {loadFromDir} = require("./rule-loader");
// dictionary dictionary
export default class RuleManager {
    /**
     * Conventional method for RuleSet
     * @param {RuleSet} ruleSet
     */
    constructor(ruleSet) {
        this.ruleSet = ruleSet;
    }

    /**
     *
     * @param {string} ruleDir ruleDir is rule directory.
     * @returns {RulesObject}
     */
    loadRules(ruleDir) {
        const rules = loadFromDir(ruleDir);
        Object.keys(rules).forEach(ruleName => {
            this.ruleSet.defineRule(ruleName, rules[ruleName]);
        });
    }

    /**
     * Registers all given rules of a plugin.
     * @param {Object} pluginRules A key/value map of rule definitions.
     * @param {String} pluginName The name of the plugin without prefix (`textlint-plugin-`).
     * @returns {void}
     */
    importPlugin(pluginRules, pluginName) {
        Object.keys(pluginRules).forEach(ruleId => {
            const qualifiedRuleId = pluginName + "/" + ruleId;
            const ruleCreator = pluginRules[ruleId];
            this.ruleSet.defineRule(qualifiedRuleId, ruleCreator);
        });
    }
}
