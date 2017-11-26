// LICENSE : MIT
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var deepEqual = require("deep-equal");
var map_like_1 = require("map-like");
var rule_creator_helper_1 = require("./rule-creator-helper");
var filterByAvailable = function (rules, rulesConfig) {
    var resultRules = Object.create(null);
    Object.keys(rules).forEach(function (key) {
        var ruleCreator = rules[key];
        rule_creator_helper_1.assertRuleShape(ruleCreator, key);
        // "rule-name" : false => disable
        var ruleConfig = rulesConfig && rulesConfig[key];
        if (ruleConfig !== false) {
            resultRules[key] = rules[key];
        }
    });
    return resultRules;
};
/**
 * Manage RuleCreator*s* object and RuleOption*s*
 */
var RuleCreatorSet = /** @class */ (function () {
    /**
     * @param {Object} [rules]
     * @param {Object} [rulesConfig]
     * @constructor
     */
    function RuleCreatorSet(rules, rulesConfig) {
        if (rules === void 0) { rules = {}; }
        if (rulesConfig === void 0) { rulesConfig = {}; }
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
    RuleCreatorSet.prototype.toKernelRulesFormat = function () {
        var _this = this;
        return this.withoutDuplicated().ruleNames.map(function (ruleName) {
            return {
                ruleId: ruleName,
                rule: _this.rules[ruleName],
                options: _this.rulesConfig[ruleName]
            };
        });
    };
    /**
     * filter duplicated rules and rulesConfig and return new RuleCreatorSet.
     * @return {RuleCreatorSet}
     */
    RuleCreatorSet.prototype.withoutDuplicated = function () {
        var _this = this;
        var newRawRules = {};
        var newRawRulesConfig = {};
        // for index
        var addedRuleMap = new map_like_1.MapLike();
        // if already contain same ruleModule and ruleConfig value
        // Fill following condition, remove it
        // 1. same ruleModule
        // 2. same ruleConfig
        this.ruleNames.forEach(function (ruleName) {
            var rule = _this.rules[ruleName];
            var ruleConfig = _this.rulesConfig[ruleName];
            var savedConfigList = addedRuleMap.get(rule) || [];
            // same ruleCreator and ruleConfig
            var hasSameConfig = savedConfigList.some(function (savedConfig) {
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
        return new RuleCreatorSet(newRawRules, newRawRulesConfig);
    };
    /**
     * forEach method
     * @example
     *  ruleCreatorSet.forEach(({ruleId, rule, ruleConfig}) => {
     *      //
     *  });
     * @param {function({ ruleId: string, rule: Function, ruleConfig: Object|boolean})} handler
     */
    RuleCreatorSet.prototype.forEach = function (handler) {
        var _this = this;
        return this.ruleNames.forEach(function (ruleName) {
            return handler({
                ruleId: ruleName,
                rule: _this.rules[ruleName],
                ruleConfig: _this.rulesConfig[ruleName]
            });
        });
    };
    RuleCreatorSet.prototype.getFixerNames = function () {
        var _this = this;
        return this.ruleNames.filter(function (ruleName) {
            return rule_creator_helper_1.hasFixer(_this.rules[ruleName]);
        });
    };
    RuleCreatorSet.prototype.mapFixer = function (mapHandler) {
        var _this = this;
        return this.getFixerNames().map(function (ruleName) {
            var rules = (_a = {}, _a[ruleName] = _this.rules[ruleName], _a);
            var rulesConfig = (_b = {}, _b[ruleName] = _this.rulesConfig[ruleName], _b);
            return mapHandler(new RuleCreatorSet(rules, rulesConfig));
            var _a, _b;
        });
    };
    /**
     * normalize `rawRulesConfigObject`.
     * if `rawRulesConfigObject` has not the rule, create `{ ruleName: true }` by default
     * @param {string[]} ruleNames
     * @param {Object} rawRulesConfigObject
     * @private
     */
    RuleCreatorSet.prototype._normalizeRulesConfig = function (ruleNames, rawRulesConfigObject) {
        var rulesConfig = {};
        // default: { ruleName: true }
        var defaultRuleConfigValue = true;
        ruleNames.forEach(function (ruleName) {
            if (rawRulesConfigObject[ruleName] === undefined) {
                rulesConfig[ruleName] = defaultRuleConfigValue;
            }
            else {
                rulesConfig[ruleName] = rawRulesConfigObject[ruleName];
            }
        });
        return rulesConfig;
    };
    return RuleCreatorSet;
}());
exports.RuleCreatorSet = RuleCreatorSet;
