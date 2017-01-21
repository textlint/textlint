// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.mapRulesConfig = mapRulesConfig;
exports.default = findRulesAndConfig;

var _textlintModuleMapper;

function _load_textlintModuleMapper() {
    return _textlintModuleMapper = _interopRequireDefault(require("../engine/textlint-module-mapper"));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var interopRequire = require("interop-require");
var ObjectAssign = require("object-assign");


/**
 * create `<plugin>/<rule>` option
 * @param {Object} [rulesConfig]
 * @param {string} presetName
 * @returns {Object}
 */
function mapRulesConfig(rulesConfig, presetName) {
    var mapped = {};
    // missing "rulesConfig"
    if (rulesConfig === undefined || (typeof rulesConfig === "undefined" ? "undefined" : _typeof(rulesConfig)) !== "object") {
        return mapped;
    }
    return (_textlintModuleMapper || _load_textlintModuleMapper()).default.createMappedObject(rulesConfig, presetName);
}
// load rulesConfig from plugins
/**
 *
 * @param ruleNames
 * @param {TextLintModuleResolver} moduleResolver
 * @returns {{}}
 */
function findRulesAndConfig() {
    var ruleNames = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var moduleResolver = arguments[1];

    var presetRulesConfig = {};
    ruleNames.forEach(function (ruleName) {
        var pkgPath = moduleResolver.resolvePresetPackageName(ruleName);
        var preset = interopRequire(pkgPath);
        if (!preset.hasOwnProperty("rules")) {
            throw new Error(ruleName + " has not rules");
        }
        if (!preset.hasOwnProperty("rulesConfig")) {
            throw new Error(ruleName + " has not rulesConfig");
        }
        // set config of <rule> to "<preset>/<rule>"
        ObjectAssign(presetRulesConfig, mapRulesConfig(preset.rulesConfig, ruleName));
    });
    return presetRulesConfig;
}
//# sourceMappingURL=preset-loader.js.map