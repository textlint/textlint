// LICENSE : MIT
"use strict";

/**
 * @typedef {{key: (...args: any[]) => any}} RulesObject
 */
export class RuleMap extends Map<string, (...args: any[]) => any> {
    /**
     * has rule at least one > 0
     * @returns {boolean}
     */
    hasRuleAtLeastOne() {
        return this.size > 0;
    }

    getAllRuleNames() {
        return this.keys();
    }

    getRule(ruleKey: string) {
        return this.get(ruleKey);
    }

    /**
     * @returns {RulesObject}
     */
    getAllRules() {
        return this.toJSON();
    }

    isDefinedRule(ruleKey: string) {
        return this.has(ruleKey);
    }

    /**
     * @param {string} ruleKey
     * @param ruleHandler
     */
    defineRule(ruleKey: string, ruleHandler: (...args: any[]) => any) {
        this.set(ruleKey, ruleHandler);
    }

    /**
     * reset defined rules
     */
    resetRules() {
        this.clear();
    }

    toJSON() {
        const object: { [index: string]: any } = {};
        this.forEach((value, key) => {
            object[key] = value;
        });
        return object;
    }
}
