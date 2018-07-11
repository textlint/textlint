// LICENSE : MIT
"use strict";
import { TextlintRuleCreator, TextlintRuleOptions } from "@textlint/kernel";

const deepEqual = require("deep-equal");
import { MapLike } from "map-like";
import { assertRuleShape, hasFixer } from "./rule-creator-helper";

const filterByAvailable = (
    rules: { [index: string]: TextlintRuleCreator },
    rulesConfig: { [index: string]: TextlintRuleOptions }
) => {
    const resultRules = Object.create(null);
    Object.keys(rules).forEach(key => {
        const ruleCreator = rules[key];
        assertRuleShape(ruleCreator, key);
        // "rule-name" : false => disable
        const ruleConfig = rulesConfig && rulesConfig[key];
        if (ruleConfig !== false) {
            resultRules[key] = rules[key];
        }
    });
    return resultRules;
};

/**
 * Textlint Rule Descriptor
 * Manage RuleCreator*s* object and RuleOption*s*
 */
export class TextlintRuleDescriptor {
    rules: any;
    ruleNames: string[];
    rulesConfig: { [index: string]: TextlintRuleOptions };
    rawRulesConfigObject: { [index: string]: TextlintRuleOptions };
    rawRulesObject: { [index: string]: TextlintRuleCreator };

    constructor(
        rules: { [index: string]: TextlintRuleCreator } = {},
        rulesConfig: { [index: string]: TextlintRuleOptions } = {}
    ) {
        this.rawRulesObject = rules;
        this.rawRulesConfigObject = rulesConfig;
        /**
         * available rule object
         * @type {Object}
         */
        this.rules = filterByAvailable(this.rawRulesObject, this.rawRulesConfigObject);
        /**
         * rule key names
         * @type {Array}
         */
        this.ruleNames = Object.keys(this.rules);
        /**
         * rules Config object
         * @type {Object}
         */
        this.rulesConfig = this._normalizeRulesConfig(this.ruleNames, this.rawRulesConfigObject);
    }

    /**
     * Convert this to TextlintKernel rules format
     * @returns {Array}
     */
    toKernelRulesFormat(): Array<any> {
        return this.withoutDuplicated().ruleNames.map(ruleName => {
            return {
                ruleId: ruleName,
                rule: this.rules[ruleName],
                options: this.rulesConfig[ruleName]
            };
        });
    }

    /**
     * filter duplicated rules and rulesConfig and return new RuleCreatorSet.
     * @return {TextlintRuleDescriptor}
     */
    withoutDuplicated(): TextlintRuleDescriptor {
        const newRawRules: {
            [index: string]: any;
        } = {};
        const newRawRulesConfig: {
            [index: string]: any;
        } = {};
        // for index
        const addedRuleMap = new MapLike<string, any[]>();
        // if already contain same ruleModule and ruleConfig value
        // Fill following condition, remove it
        // 1. same ruleModule
        // 2. same ruleConfig
        this.ruleNames.forEach(ruleName => {
            const rule = this.rules[ruleName];
            const ruleConfig = this.rulesConfig[ruleName];
            const savedConfigList = addedRuleMap.get(rule) || [];
            // same ruleCreator and ruleConfig
            const hasSameConfig = savedConfigList.some(savedConfig => {
                return deepEqual(savedConfig, ruleConfig, { strict: true });
            });
            if (hasSameConfig) {
                return;
            }
            newRawRules[ruleName] = rule;
            newRawRulesConfig[ruleName] = ruleConfig;
            // saved
            savedConfigList.push(ruleConfig);
            addedRuleMap.set(rule, savedConfigList);
        });
        addedRuleMap.clear();
        return new TextlintRuleDescriptor(newRawRules, newRawRulesConfig);
    }

    /**
     * forEach method
     * @example
     *  ruleCreatorSet.forEach(({ruleId, rule, ruleConfig}) => {
     *      //
     *  });
     * @param {function({ ruleId: string, rule: Function, ruleConfig: Object|boolean})} handler
     */
    forEach(handler: (arg0: { ruleId: string; rule: Function; ruleConfig: object | boolean }) => void) {
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

    mapFixer(mapHandler: (set: TextlintRuleDescriptor) => any) {
        return this.getFixerNames().map(ruleName => {
            const rules = { [ruleName]: this.rules[ruleName] };
            const rulesConfig = { [ruleName]: this.rulesConfig[ruleName] };
            return mapHandler(new TextlintRuleDescriptor(rules, rulesConfig));
        });
    }

    /**
     * normalize `rawRulesConfigObject`.
     * if `rawRulesConfigObject` has not the rule, create `{ ruleName: true }` by default
     * @param {string[]} ruleNames
     * @param {Object} rawRulesConfigObject
     * @private
     */
    private _normalizeRulesConfig(ruleNames: string[], rawRulesConfigObject: { [index: string]: any }) {
        const rulesConfig: { [index: string]: any } = {};
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
