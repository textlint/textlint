// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _configUtil;

function _load_configUtil() {
    return _configUtil = require("../util/config-util");
}

var _ruleLoader;

function _load_ruleLoader() {
    return _ruleLoader = require("./rule-loader");
}

var _logger;

function _load_logger() {
    return _logger = _interopRequireDefault(require("../util/logger"));
}

var _textlintModuleResolver;

function _load_textlintModuleResolver() {
    return _textlintModuleResolver = _interopRequireDefault(require("./textlint-module-resolver"));
}

var _textlintModuleMapper;

function _load_textlintModuleMapper() {
    return _textlintModuleMapper = _interopRequireDefault(require("./textlint-module-mapper"));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = require("events");
var interopRequire = require("interop-require");
var debug = require("debug")("textlint:module-loader");
var isFile = require("is-file");

var TextLintModuleLoader = function (_EventEmitter) {
    _inherits(TextLintModuleLoader, _EventEmitter);

    _createClass(TextLintModuleLoader, null, [{
        key: "Event",
        get: function get() {
            return {
                rule: "rule",
                filterRule: "filterRule",
                processor: "preset",
                error: "error"
            };
        }
    }]);

    function TextLintModuleLoader(config) {
        _classCallCheck(this, TextLintModuleLoader);

        /**
         * @type {Config} config is need for static prefix value
         */
        var _this = _possibleConstructorReturn(this, (TextLintModuleLoader.__proto__ || Object.getPrototypeOf(TextLintModuleLoader)).call(this));

        _this.config = config;
        /**
         * @type {TextLintModuleResolver}
         */
        _this.moduleResolver = new (_textlintModuleResolver || _load_textlintModuleResolver()).default(_this.config.constructor, _this.config.rulesBaseDirectory);
        return _this;
    }

    /**
     * set up lint rules using {@lint Config} object.
     * The {@lint Config} object was created with initialized {@link TextLintEngine} (as-known Constructor).
     * @param {Config} config the config is parsed object
     */


    _createClass(TextLintModuleLoader, [{
        key: "loadFromConfig",
        value: function loadFromConfig(config) {
            var _this2 = this;

            debug("config %O", config);
            // --ruledir
            if (config.rulePaths) {
                // load in additional rules
                config.rulePaths.forEach(function (rulesDir) {
                    debug("Loading rules from %o", rulesDir);
                    var rules = (0, (_ruleLoader || _load_ruleLoader()).loadFromDir)(rulesDir);
                    Object.keys(rules).forEach(function (ruleName) {
                        var entry = [ruleName, rules[ruleName]];
                        _this2.emit(TextLintModuleLoader.Event.rule, entry);
                    });
                });
            }
            // --rule
            if (config.rules) {
                // load in additional rules
                config.rules.forEach(function (ruleName) {
                    _this2.loadRule(ruleName);
                });
            }
            // TODO: --filter
            if (config.filterRules) {
                // load in additional filterRules
                config.filterRules.forEach(function (ruleName) {
                    _this2.loadFilterRule(ruleName);
                });
            }
            // --preset
            if (config.presets) {
                config.presets.forEach(function (presetName) {
                    _this2.loadPreset(presetName);
                });
            }
            // --plugin
            if (config.plugins) {
                // load in additional rules from plugin
                config.plugins.forEach(function (pluginName) {
                    _this2.loadPlugin(pluginName);
                });
            }
        }

        /**
         * load rule from plugin name.
         * plugin module has `rules` object and define rule with plugin prefix.
         * @param {string} pluginName
         */

    }, {
        key: "loadPlugin",
        value: function loadPlugin(pluginName) {
            var _this3 = this;

            var pkgPath = this.moduleResolver.resolvePluginPackageName(pluginName);
            debug("Loading rules from plugin: %s", pkgPath);
            var plugin = interopRequire(pkgPath);
            var PLUGIN_NAME_PREFIX = this.config.constructor.PLUGIN_NAME_PREFIX;
            var prefixMatch = new RegExp("^" + PLUGIN_NAME_PREFIX);
            var pluginNameWithoutPrefix = pluginName.replace(prefixMatch, "");
            // Processor plugin doesn't define rules
            if (plugin.hasOwnProperty("rules")) {
                var entities = (_textlintModuleMapper || _load_textlintModuleMapper()).default.createEntities(plugin.rules, pluginNameWithoutPrefix);
                entities.forEach(function (entry) {
                    _this3.emit(TextLintModuleLoader.Event.rule, entry);
                });
            }
            // register plugin.Processor
            if (plugin.hasOwnProperty("Processor")) {
                var processorEntry = [pluginNameWithoutPrefix, plugin.Processor];
                this.emit(TextLintModuleLoader.Event.processor, processorEntry);
            }
        }
    }, {
        key: "loadPreset",
        value: function loadPreset(presetName) {
            var _this4 = this;

            /*
             Caution: Rules of preset are defined as following.
                 {
                    "rules": {
                        "preset-gizmo": {
                            "ruleA": false
                     }
                }
             It mean that "ruleA" is defined as "preset-gizmo/ruleA"
              */
            var RULE_NAME_PREFIX = this.config.constructor.RULE_NAME_PREFIX;
            // Strip **rule** prefix
            // textlint-rule-preset-gizmo -> preset-gizmo
            var prefixMatch = new RegExp("^" + RULE_NAME_PREFIX);
            var presetRuleNameWithoutPrefix = presetName.replace(prefixMatch, "");
            // ignore plugin's rule
            if ((0, (_configUtil || _load_configUtil()).isPluginRuleKey)(presetRuleNameWithoutPrefix)) {
                (_logger || _load_logger()).default.warn(presetRuleNameWithoutPrefix + " is Plugin's rule. This is unknown case, please report issue.");
                return;
            }

            var pkgPath = this.moduleResolver.resolvePresetPackageName(presetName);
            debug("Loading rules from preset: %s", pkgPath);
            var preset = interopRequire(pkgPath);
            var entities = (_textlintModuleMapper || _load_textlintModuleMapper()).default.createEntities(preset.rules, presetRuleNameWithoutPrefix);
            entities.forEach(function (entry) {
                _this4.emit(TextLintModuleLoader.Event.rule, entry);
            });
        }

        /**
         * load rule file with `ruleName` and define rule.
         * if rule is not found, then throw ReferenceError.
         * if already rule is loaded, do not anything.
         * @param {string} ruleName
         */

    }, {
        key: "loadRule",
        value: function loadRule(ruleName) {
            /*
               Task
                 - check already define
                 - resolve package name
                 - load package
                 - emit rule
            */
            // ruleName is filePath
            if (isFile(ruleName)) {
                var _ruleCreator = interopRequire(ruleName);
                var _ruleEntry = [ruleName, _ruleCreator];
                this.emit(TextLintModuleLoader.Event.rule, _ruleEntry);
                return;
            }
            // ignore already defined rule
            // ignore rules from rulePaths because avoid ReferenceError is that try to require.
            var RULE_NAME_PREFIX = this.config.constructor.RULE_NAME_PREFIX;
            var prefixMatch = new RegExp("^" + RULE_NAME_PREFIX);
            var definedRuleName = ruleName.replace(prefixMatch, "");
            // ignore plugin's rule
            if ((0, (_configUtil || _load_configUtil()).isPluginRuleKey)(definedRuleName)) {
                (_logger || _load_logger()).default.warn(definedRuleName + " is Plugin's rule. This is unknown case, please report issue.");
                return;
            }
            var pkgPath = this.moduleResolver.resolveRulePackageName(ruleName);
            debug("Loading rules from %s", pkgPath);
            var ruleCreator = interopRequire(pkgPath);
            var ruleEntry = [definedRuleName, ruleCreator];
            this.emit(TextLintModuleLoader.Event.rule, ruleEntry);
        }

        /**
         * load filter rule file with `ruleName` and define rule.
         * if rule is not found, then throw ReferenceError.
         * if already rule is loaded, do not anything.
         * @param {string} ruleName
         */

    }, {
        key: "loadFilterRule",
        value: function loadFilterRule(ruleName) {
            /*
               Task
                 - check already define
                 - resolve package name
                 - load package
                 - emit rule
            */
            // ignore already defined rule
            // ignore rules from rulePaths because avoid ReferenceError is that try to require.
            if (isFile(ruleName)) {
                var _ruleCreator2 = interopRequire(ruleName);
                var _ruleEntry2 = [ruleName, _ruleCreator2];
                this.emit(TextLintModuleLoader.Event.filterRule, _ruleEntry2);
                return;
            }
            var RULE_NAME_PREFIX = this.config.constructor.FILTER_RULE_NAME_PREFIX;
            var prefixMatch = new RegExp("^" + RULE_NAME_PREFIX);
            var definedRuleName = ruleName.replace(prefixMatch, "");
            // ignore plugin's rule
            if ((0, (_configUtil || _load_configUtil()).isPluginRuleKey)(definedRuleName)) {
                (_logger || _load_logger()).default.warn(definedRuleName + " is Plugin's rule. This is unknown case, please report issue.");
                return;
            }
            var pkgPath = this.moduleResolver.resolveFilterRulePackageName(ruleName);
            debug("Loading filter rules from %s", pkgPath);
            var ruleCreator = interopRequire(pkgPath);
            var ruleEntry = [definedRuleName, ruleCreator];
            this.emit(TextLintModuleLoader.Event.filterRule, ruleEntry);
        }
    }]);

    return TextLintModuleLoader;
}(EventEmitter);

exports.default = TextLintModuleLoader;
//# sourceMappingURL=textlint-module-loader.js.map