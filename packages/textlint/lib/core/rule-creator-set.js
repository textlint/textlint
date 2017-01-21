// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ruleCreatorHelper;

function _load_ruleCreatorHelper() {
    return _ruleCreatorHelper = require("./rule-creator-helper");
}

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var deepEqual = require("deep-equal");
var MapLike = require("map-like");

var filterByAvailable = function filterByAvailable(rules, rulesConfig) {
    var resultRules = Object.create(null);
    Object.keys(rules).forEach(function (key) {
        var ruleCreator = rules[key];
        (0, (_ruleCreatorHelper || _load_ruleCreatorHelper()).assertRuleShape)(ruleCreator, key);
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

var RuleCreatorSet = function () {
    /**
     * @param {Object} [rules]
     * @param {Object} [rulesConfig]
     * @constructor
     */
    function RuleCreatorSet() {
        var rules = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var rulesConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, RuleCreatorSet);

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
     * filter duplicated rules and rulesConfig and return new RuleCreatorSet.
     * @return {RuleCreatorSet}
     */


    _createClass(RuleCreatorSet, [{
        key: "withoutDuplicated",
        value: function withoutDuplicated() {
            var _this = this;

            var newRawRules = {};
            var newRawRulesConfig = {};
            // for index
            var addedRuleMap = new MapLike();
            // if already contain same ruleModule and ruleConfig value
            // Fill following condition, remove it
            // 1. same ruleModule
            // 2. same ruleConfig
            this.ruleNames.forEach(function (ruleName) {
                var rule = _this.rules[ruleName];
                var ruleConfig = _this.rulesConfig[ruleName];
                var savedConfigList = addedRuleMap.has(rule) ? addedRuleMap.get(rule) : [];
                // same ruleCreator and ruleConfig
                var hasSameConfig = savedConfigList.some(function (savedConfig) {
                    return deepEqual(savedConfig, ruleConfig, { strict: true });
                });
                if (hasSameConfig) {
                    return false;
                }
                newRawRules[ruleName] = rule;
                newRawRulesConfig[ruleName] = ruleConfig;
                // saved
                savedConfigList.push(ruleConfig);
                addedRuleMap.set(rule, savedConfigList);
            });
            addedRuleMap.clear();
            return new RuleCreatorSet(newRawRules, newRawRulesConfig);
        }

        /**
         * forEach method
         * @example
         *  ruleCreatorSet.forEach(({ruleId, rule, ruleConfig}) => {
         *      // 
         *  });
         * @param {function({ ruleId: string, rule: Function, ruleConfig: Object|boolean})} handler
         */

    }, {
        key: "forEach",
        value: function forEach(handler) {
            var _this2 = this;

            return this.ruleNames.forEach(function (ruleName) {
                return handler({
                    ruleId: ruleName,
                    rule: _this2.rules[ruleName],
                    ruleConfig: _this2.rulesConfig[ruleName]
                });
            });
        }
    }, {
        key: "getFixerNames",
        value: function getFixerNames() {
            var _this3 = this;

            return this.ruleNames.filter(function (ruleName) {
                return (0, (_ruleCreatorHelper || _load_ruleCreatorHelper()).hasFixer)(_this3.rules[ruleName]);
            });
        }
    }, {
        key: "mapFixer",
        value: function mapFixer(mapHandler) {
            var _this4 = this;

            return this.getFixerNames().map(function (ruleName) {
                var rules = _defineProperty({}, ruleName, _this4.rules[ruleName]);
                var rulesConfig = _defineProperty({}, ruleName, _this4.rulesConfig[ruleName]);
                return mapHandler(new RuleCreatorSet(rules, rulesConfig));
            });
        }

        /**
         * normalize `rawRulesConfigObject`.
         * if `rawRulesConfigObject` has not the rule, create `{ ruleName: true }` by default
         * @param {string[]} ruleNames
         * @param {Object} rawRulesConfigObject
         * @private
         */

    }, {
        key: "_normalizeRulesConfig",
        value: function _normalizeRulesConfig(ruleNames, rawRulesConfigObject) {
            var rulesConfig = {};
            // default: { ruleName: true }
            var defaultRuleConfigValue = true;
            ruleNames.forEach(function (ruleName) {
                if (rawRulesConfigObject[ruleName] === undefined) {
                    rulesConfig[ruleName] = defaultRuleConfigValue;
                } else {
                    rulesConfig[ruleName] = rawRulesConfigObject[ruleName];
                }
            });
            return rulesConfig;
        }
    }]);

    return RuleCreatorSet;
}();

exports.default = RuleCreatorSet;
//# sourceMappingURL=rule-creator-set.js.map