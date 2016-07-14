// LICENSE : MIT
"use strict";
const MapLike = require("map-like");
/**
 * @typedef {{key: Function}} RulesObject
 */
export default class RuleMap extends MapLike {
    /**
     * has rule at least one > 0
     * @returns {boolean}
     */
    hasRuleAtLeastOne() {
        return this.keys().length > 0;
    }

    getAllRuleNames() {
        return this.keys();
    }

    getRule(ruleKey) {
        return this.get(ruleKey);
    }

    /**
     * @returns {RulesObject}
     */
    getAllRules() {
        return this.toJSON();
    }

    isDefinedRule(ruleKey) {
        return this.has(ruleKey);
    }


    /**
     * @param {string} ruleKey
     * @param ruleHandler
     */
    defineRule(ruleKey, ruleHandler) {
        this.set(ruleKey, ruleHandler);
    }

    /**
     * reset defined rules
     */
    resetRules() {
        this.clear();
    }

    toJSON() {
        const object = {};
        this.forEach((value, key) => {
            object[key] = value;
        });
        return object;
    }
}
