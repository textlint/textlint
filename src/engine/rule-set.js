// LICENSE : MIT
"use strict";
// dictionary dictionary
export default class RuleSet {
    constructor() {
        /**
         * @typedef {{key: Function}} RulesObject
         */
        /**
         * Defined all rules in this object.
         * @type {RulesObject}
         */
        this.rules = Object.create(null);
    }

    /**
     * has rule at least one > 0
     * @returns {boolean}
     */
    hasRuleAtLeastOne() {
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
     * @param {string} ruleKey
     * @param ruleHandler
     */
    defineRule(ruleKey, ruleHandler) {
        this.rules[ruleKey] = ruleHandler;
    }

    /**
     * reset defined rules
     */
    resetRules() {
        this.rules = Object.create(null);
    }
}
