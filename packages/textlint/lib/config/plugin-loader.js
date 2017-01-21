// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.mapRulesConfig = mapRulesConfig;
exports.loadRulesConfig = loadRulesConfig;
exports.loadAvailableExtensions = loadAvailableExtensions;

var _textlintModuleMapper;

function _load_textlintModuleMapper() {
    return _textlintModuleMapper = _interopRequireDefault(require("../engine/textlint-module-mapper"));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var interopRequire = require("interop-require");
var ObjectAssign = require("object-assign");
var debug = require("debug")("textlint:plugin-loader");
var assert = require("assert");
function mapRulesConfig(rulesConfig, pluginName) {
    var mapped = {};
    if (rulesConfig === undefined || (typeof rulesConfig === "undefined" ? "undefined" : _typeof(rulesConfig)) !== "object") {
        return mapped;
    }
    return (_textlintModuleMapper || _load_textlintModuleMapper()).default.createMappedObject(rulesConfig, pluginName);
}
// load rulesConfig from plugins
/**
 *
 * @param pluginNames
 * @param {TextLintModuleResolver} moduleResolver
 * @returns {{}}
 */
function loadRulesConfig() {
    var pluginNames = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var moduleResolver = arguments[1];

    var pluginRulesConfig = {};
    pluginNames.forEach(function (pluginName) {
        var pkgPath = moduleResolver.resolvePluginPackageName(pluginName);
        var plugin = interopRequire(pkgPath);
        if (!plugin.hasOwnProperty("rulesConfig")) {
            return;
        }
        debug(pluginName + " has rulesConfig");
        // set config of <rule> to "<plugin>/<rule>"
        ObjectAssign(pluginRulesConfig, mapRulesConfig(plugin.rulesConfig, pluginName));
    });
    return pluginRulesConfig;
}

function loadAvailableExtensions() {
    var pluginNames = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var moduleResolver = arguments[1];

    var availableExtensions = [];
    pluginNames.forEach(function (pluginName) {
        var pkgPath = moduleResolver.resolvePluginPackageName(pluginName);
        var plugin = interopRequire(pkgPath);
        if (!plugin.hasOwnProperty("Processor")) {
            return;
        }
        var Processor = plugin.Processor;
        debug(pluginName + " has Processor");
        assert(typeof Processor.availableExtensions === "function", "Processor.availableExtensions() should be implemented");
        availableExtensions.push.apply(availableExtensions, _toConsumableArray(Processor.availableExtensions()));
    });
    return availableExtensions;
}
//# sourceMappingURL=plugin-loader.js.map