// LICENSE : MIT
"use strict";

import type { TextlintRuleModule } from "@textlint/types";

/**
 * @typedef {{key: TextlintRuleModule}} RulesObject
 */
export class RuleMap extends Map<string, TextlintRuleModule> {
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
    defineRule(ruleKey: string, ruleHandler: TextlintRuleModule) {
        this.set(ruleKey, ruleHandler);
    }

    /**
     * reset defined rules
     */
    resetRules() {
        this.clear();
    }

    toJSON() {
        const object: { [index: string]: TextlintRuleModule } = {};
        this.forEach((value, key) => {
            object[key] = value;
        });
        return object;
    }
}
