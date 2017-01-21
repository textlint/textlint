// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MapLike = require("map-like");
/**
 * @typedef {{key: Function}} RulesObject
 */

var RuleMap = function (_MapLike) {
    _inherits(RuleMap, _MapLike);

    function RuleMap() {
        _classCallCheck(this, RuleMap);

        return _possibleConstructorReturn(this, (RuleMap.__proto__ || Object.getPrototypeOf(RuleMap)).apply(this, arguments));
    }

    _createClass(RuleMap, [{
        key: "hasRuleAtLeastOne",

        /**
         * has rule at least one > 0
         * @returns {boolean}
         */
        value: function hasRuleAtLeastOne() {
            return this.keys().length > 0;
        }
    }, {
        key: "getAllRuleNames",
        value: function getAllRuleNames() {
            return this.keys();
        }
    }, {
        key: "getRule",
        value: function getRule(ruleKey) {
            return this.get(ruleKey);
        }

        /**
         * @returns {RulesObject}
         */

    }, {
        key: "getAllRules",
        value: function getAllRules() {
            return this.toJSON();
        }
    }, {
        key: "isDefinedRule",
        value: function isDefinedRule(ruleKey) {
            return this.has(ruleKey);
        }

        /**
         * @param {string} ruleKey
         * @param ruleHandler
         */

    }, {
        key: "defineRule",
        value: function defineRule(ruleKey, ruleHandler) {
            this.set(ruleKey, ruleHandler);
        }

        /**
         * reset defined rules
         */

    }, {
        key: "resetRules",
        value: function resetRules() {
            this.clear();
        }
    }, {
        key: "toJSON",
        value: function toJSON() {
            var object = {};
            this.forEach(function (value, key) {
                object[key] = value;
            });
            return object;
        }
    }]);

    return RuleMap;
}(MapLike);

exports.default = RuleMap;
//# sourceMappingURL=rule-map.js.map