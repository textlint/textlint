// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getSeverity = getSeverity;

var _SeverityLevel;

function _load_SeverityLevel() {
    return _SeverityLevel = _interopRequireDefault(require("./type/SeverityLevel"));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var assert = require("assert");

/**
 * get severity level from ruleConfig.
 * @param {Object|boolean|undefined} ruleConfig
 * @returns {number}
 */
function getSeverity(ruleConfig) {
    if (ruleConfig == null) {
        return (_SeverityLevel || _load_SeverityLevel()).default.error;
    }
    // rule:<true|false>
    if (typeof ruleConfig === "boolean") {
        return ruleConfig ? (_SeverityLevel || _load_SeverityLevel()).default.error : (_SeverityLevel || _load_SeverityLevel()).default.none;
    }
    if (ruleConfig.severity) {
        assert((_SeverityLevel || _load_SeverityLevel()).default[ruleConfig.severity] !== undefined, "please set\n\"rule-key\": {\n    \"severity\": \"<warning|error>\"\n}");
        return (_SeverityLevel || _load_SeverityLevel()).default[ruleConfig.severity];
    }
    return (_SeverityLevel || _load_SeverityLevel()).default.error;
}
//# sourceMappingURL=rule-severity.js.map