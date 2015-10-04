// LICENSE : MIT
'use strict';
const loadRuleDir = require('./load-rules');
const objectAssign = require('object-assign');
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
        this.rules = [];
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
            let qualifiedRuleId = pluginName + "/" + ruleId;
            let ruleCreator = pluginRules[ruleId];
            this.define(qualifiedRuleId, ruleCreator);
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
