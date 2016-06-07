// LICENSE : MIT
"use strict";
const debug = require("debug")("textlint:rule-creator-set");
import {assertRuleShape, hasFixer} from "./rule-creator-helper";
const filterByAvailable = (rules, rulesConfig) => {
    const resultRules = Object.create(null);
    Object.keys(rules).forEach(key => {
        const ruleCreator = rules[key];
        assertRuleShape(ruleCreator, key);
        // "rule-name" : false => disable
        const ruleConfig = rulesConfig && rulesConfig[key];
        if (ruleConfig !== false) {
            debug("use \"%s\" rule", key);
            resultRules[key] = rules[key];
        }
    });
    return resultRules;
};

/**
 * Manage RuleCreator*s* object and RuleOption*s*
 */
export default class RuleCreatorSet {
    /**
     * @param {Object} rules
     * @param {Object} [rulesConfig]
     * @constructor
     */
    constructor(rules = {}, rulesConfig = {}) {
        this.rawRulesObject = rules;
        this.rawRulesConfigObject = rulesConfig;
        // initialize
        this.rules = filterByAvailable(this.rawRulesObject, this.rawRulesConfigObject);
        this.ruleNames = Object.keys(this.rules);
        this.rulesConfig = this._normalizeRulesConfig(this.ruleNames, this.rawRulesConfigObject);
    }

    /**
     * forEach method
     * @example
     *  ruleCreatorSet.forEach(({ruleId, rule, ruleConfig}) => {
     *      // 
     *  });
     * @param {function({ ruleId: string, rule: Function, ruleConfig: Object|boolean})} handler
     */
    forEach(handler) {
        return this.ruleNames.forEach(ruleName => {
            return handler({
                ruleId: ruleName,
                rule: this.rules[ruleName],
                ruleConfig: this.rulesConfig[ruleName]
            });
        });
    }

    getFixerNames() {
        return this.ruleNames.filter(ruleName => {
            return hasFixer(this.rules[ruleName]);
        });
    }

    mapFixer(mapHandler) {
        return this.getFixerNames().map(ruleName => {
            const rules = {[ruleName]: this.rules[ruleName]};
            const rulesConfig = {[ruleName]: this.rulesConfig[ruleName]};
            return mapHandler(new RuleCreatorSet(rules, rulesConfig));
        });
    }

    /**
     * normalize `rawRulesConfigObject`.
     * if `rawRulesConfigObject` has not the rule, create `{ ruleName: true }` by default
     * @param {string[]} ruleNames
     * @param {Object[]} rawRulesConfigObject
     * @private
     */
    _normalizeRulesConfig(ruleNames, rawRulesConfigObject) {
        const rulesConfig = {};
        // default: { ruleName: true }
        const defaultRuleConfigValue = true;
        ruleNames.forEach(ruleName => {
            if (rawRulesConfigObject[ruleName] === undefined) {
                rulesConfig[ruleName] = defaultRuleConfigValue;
            } else {
                rulesConfig[ruleName] = rawRulesConfigObject[ruleName];
            }
        });
        return rulesConfig;
    }
}
