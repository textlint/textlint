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
        this.rulesConfig = this.rawRulesConfigObject;
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
}
