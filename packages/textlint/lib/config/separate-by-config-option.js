// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = separateAvailableOrDisable;

var _configUtil;

function _load_configUtil() {
    return _configUtil = require("../util/config-util");
}

/**
 * Get rule keys from `.textlintrc` config object.
 * @param {Object} [rulesConfig]
 * @returns {{available: string[], disable: string[]}}
 */
function separateAvailableOrDisable(rulesConfig) {
    var ruleOf = {
        presets: [],
        available: [],
        disable: []
    };
    if (!rulesConfig) {
        return ruleOf;
    }
    Object.keys(rulesConfig).forEach(function (key) {
        // `textlint-rule-preset-XXX`
        if ((0, (_configUtil || _load_configUtil()).isPresetRuleKey)(key)) {
            if (_typeof(rulesConfig[key]) === "object" || rulesConfig[key] === true) {
                ruleOf.presets.push(key);
            }
            return;
        }
        // `<plugin>/<rule-key>` should ignored
        if ((0, (_configUtil || _load_configUtil()).isPluginRuleKey)(key)) {
            return;
        }
        // ignore `false` value
        if (_typeof(rulesConfig[key]) === "object" || rulesConfig[key] === true) {
            ruleOf.available.push(key);
        } else {
            ruleOf.disable.push(key);
        }
    });
    return ruleOf;
}
//# sourceMappingURL=separate-by-config-option.js.map