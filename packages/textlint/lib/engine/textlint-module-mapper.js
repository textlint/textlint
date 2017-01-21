// LICENSE : MIT
"use strict";
/**
 * This class is a helper to create mapping of rules and rulesConfig
 * Main purpose hide the RuleSeparator "/".
 */
// The separator of `<plugin>/<rule>` 

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RuleSeparator = "/";

var TextLintModuleMapper = function () {
    function TextLintModuleMapper() {
        _classCallCheck(this, TextLintModuleMapper);
    }

    _createClass(TextLintModuleMapper, null, [{
        key: "createEntities",

        /**
         * create entities from rules/rulesConfig and prefix
         * entities is a array which contain [key, value]
         * see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries
         * @param {Object} pluginRules an object is like "rules" or "rulesConfig" of plugin
         * @param {string} prefixKey prefix key is plugin name or preset name
         * @returns {[string, string][]}
         */
        value: function createEntities(pluginRules, prefixKey) {
            var entities = [];
            Object.keys(pluginRules).forEach(function (ruleId) {
                var qualifiedRuleId = prefixKey + RuleSeparator + ruleId;
                var ruleCreator = pluginRules[ruleId];
                entities.push([qualifiedRuleId, ruleCreator]);
            });
            return entities;
        }

        /**
         * create an object from rules/rulesConfig and prefix
         * the object shape is { key: value, key2: value }
         * @param {Object} pluginRules an object is like "rules" or "rulesConfig" of plugin
         * @param {string} prefixKey prefix key is plugin name or preset name
         * @returns {Object}
         */

    }, {
        key: "createMappedObject",
        value: function createMappedObject(pluginRules, prefixKey) {
            var mapped = {};
            Object.keys(pluginRules).forEach(function (key) {
                mapped[prefixKey + "/" + key] = pluginRules[key];
            });
            return mapped;
        }
    }]);

    return TextLintModuleMapper;
}();

exports.default = TextLintModuleMapper;
//# sourceMappingURL=textlint-module-mapper.js.map