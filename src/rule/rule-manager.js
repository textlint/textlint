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
