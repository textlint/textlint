// LICENSE : MIT
"use strict";
const loadRuleDir = require("./load-rules");
const objectAssign = require("object-assign");
// dictionary dictionary
export default class RuleManager {
    constructor() {
        /**
         * @typedef {{key: Function}} RulesObject
         */
        /**
         * Defined all rules in this object.
         * @type {RulesObject}
         */
        this.rules = {};
    }

    /**
     * has rule at least one > 0
     * @returns {boolean}
     */
    hasRuleAtLeastOne(){
        return this.getAllRuleNames().length > 0;
    }

    getAllRuleNames() {
        return Object.keys(this.rules);
    }

    getRule(ruleKey) {
        return this.rules[ruleKey];
    }

    /**
     * @returns {RulesObject}
     */
    getAllRules() {
        return this.rules;
    }

    isDefinedRule(ruleKey) {
        return this.getRule(ruleKey) != null;
    }

    /**
     *
     * @param {string} ruleDir ruleDir is rule directory.
     * @returns {RulesObject}
     */
    loadRules(ruleDir) {
        objectAssign(this.rules, loadRuleDir(ruleDir));
        return this.rules;
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
            this.defineRule(qualifiedRuleId, ruleCreator);
        });
    }

    /**
     *
     * @param {string} ruleKey
     * @param ruleHandler
     */
    defineRule(ruleKey, ruleHandler) {
        this.rules[ruleKey] = ruleHandler;
    }

    resetRules() {
        this.rules = Object.create(null);
    }
}
