// LICENSE : MIT
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _configLoader;

function _load_configLoader() {
    return _configLoader = _interopRequireDefault(require("./config-loader"));
}

var _configUtil;

function _load_configUtil() {
    return _configUtil = require("../util/config-util");
}

var _presetLoader;

function _load_presetLoader() {
    return _presetLoader = require("./preset-loader");
}

var _presetLoader2;

function _load_presetLoader2() {
    return _presetLoader2 = _interopRequireDefault(require("./preset-loader"));
}

var _pluginLoader;

function _load_pluginLoader() {
    return _pluginLoader = require("./plugin-loader");
}

var _textlintModuleResolver;

function _load_textlintModuleResolver() {
    return _textlintModuleResolver = _interopRequireDefault(require("../engine/textlint-module-resolver"));
}

var _separateByConfigOption;

function _load_separateByConfigOption() {
    return _separateByConfigOption = _interopRequireDefault(require("./separate-by-config-option"));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var objectAssign = require("object-assign");
var md5 = require("md5");
var fs = require("fs");
var assert = require("assert");
var pkg = require("../../package.json");
var concat = require("unique-concat");
var path = require("path");

/**
 * Convert config of preset to rulesConfig flat path format.
 *
 * e.g.)
 * {
 *  "preset-a" : { "key": "value"}
 * }
 * => {"preset-a/key": "value"}
 *
 * @param rulesConfig
 * @returns {{string: string}}
 */
function convertRulesConfigToFlatPath(rulesConfig) {
    if (!rulesConfig) {
        return {};
    }
    var filteredConfig = {};
    Object.keys(rulesConfig).forEach(function (key) {
        if ((0, (_configUtil || _load_configUtil()).isPresetRuleKey)(key)) {
            // <preset>/<rule>
            objectAssign(filteredConfig, (0, (_presetLoader || _load_presetLoader()).mapRulesConfig)(rulesConfig[key], key));
            return;
        }
        filteredConfig[key] = rulesConfig[key];
    });
    return filteredConfig;
}
/**
 * @type {TextLintConfig}
 */
var defaultOptions = Object.freeze({
    // rule package names
    rules: [],
    // disabled rule package names
    // always should start with empty
    disabledRules: [],
    // rules config object
    rulesConfig: {},
    // filter rule package names
    filterRules: [],
    disabledFilterRules: [],
    // rules config object
    filterRulesConfig: {},
    // preset package names
    // e.g.) ["preset-foo"]
    presets: [],
    // plugin package names
    plugins: [],
    // base directory for loading {rule, config, plugin} modules
    rulesBaseDirectory: undefined,
    // ".textlint" file path
    configFile: undefined,
    // rule directories
    rulePaths: [],
    // available extensions
    // if set the option, should filter by extension.
    extensions: [],
    // formatter file name
    // e.g.) stylish.js => set "stylish"
    // NOTE: default formatter is defined in Engine,
    // because There is difference between TextLintEngine and TextFixEngine.
    formatterName: undefined,
    // --no-color
    color: true,
    // --cache : enable or disable
    cache: false,
    // --cache-location: cache file path
    cacheLocation: path.resolve(process.cwd(), ".textlintcache")
});

// Priority: CLI > Code options > config file

var Config = function () {
    _createClass(Config, [{
        key: "hash",


        /**
         * Return hash string of the config and textlint version
         * @returns {string}
         */
        get: function get() {
            var version = pkg.version;
            var toString = JSON.stringify(this.toJSON());
            return md5(version + "-" + toString);
        }

        /**
         * initialize with options.
         * @param {TextLintConfig} options the option object is defined as TextLintConfig.
         * @returns {Config}
         * @constructor
         */

    }], [{
        key: "initWithCLIOptions",


        /**
         * Create config object form command line options
         * See options.js
         * @param {object} cliOptions the options is command line option object. @see options.js
         * @returns {Config}
         */
        value: function initWithCLIOptions(cliOptions) {
            var options = {};
            options.extensions = cliOptions.ext ? cliOptions.ext : defaultOptions.extensions;
            options.rules = cliOptions.rule ? cliOptions.rule : defaultOptions.rules;
            // TODO: CLI --filter <rule>?
            options.filterRules = defaultOptions.filterRules;
            options.disabledFilterRules = defaultOptions.disabledFilterRules;
            // TODO: CLI --disable <rule>?
            options.disabledRules = defaultOptions.disabledRules;
            options.presets = cliOptions.preset ? cliOptions.preset : defaultOptions.presets;
            options.plugins = cliOptions.plugin ? cliOptions.plugin : defaultOptions.plugins;
            options.configFile = cliOptions.config ? cliOptions.config : defaultOptions.configFile;
            options.rulePaths = cliOptions.rulesdir ? cliOptions.rulesdir : defaultOptions.rulePaths;
            options.formatterName = cliOptions.format ? cliOptions.format : defaultOptions.formatterName;
            options.color = cliOptions.color !== undefined ? cliOptions.color : defaultOptions.color;
            // --cache
            options.cache = cliOptions.cache !== undefined ? cliOptions.cache : defaultOptions.cache;
            // --cache-location="path/to/file"
            options.cacheLocation = cliOptions.cacheLocation !== undefined ? path.resolve(process.cwd(), cliOptions.cacheLocation) : defaultOptions.cacheLocation;
            return this.initWithAutoLoading(options);
        }

        /* eslint-disable complexity */
        // load config and merge options.

    }, {
        key: "initWithAutoLoading",
        value: function initWithAutoLoading() {
            var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            // Base directory
            var rulesBaseDirectory = options.rulesBaseDirectory ? options.rulesBaseDirectory : defaultOptions.rulesBaseDirectory;
            // Create resolver
            var moduleResolver = new (_textlintModuleResolver || _load_textlintModuleResolver()).default(this, rulesBaseDirectory);
            // => ConfigFile
            // configFile is optional
            // => load .textlintrc
            var configFileRawOptions = (0, (_configLoader || _load_configLoader()).default)(options.configFile, {
                moduleResolver: moduleResolver,
                configFileName: this.CONFIG_FILE_NAME
            }) || {};
            // "rules" field is here!
            var configRulesObject = (0, (_separateByConfigOption || _load_separateByConfigOption()).default)(configFileRawOptions.rules);
            // "filters" field is here!
            var configFilterRulesObject = (0, (_separateByConfigOption || _load_separateByConfigOption()).default)(configFileRawOptions.filters);
            var configPresets = configRulesObject.presets;
            var configFilePlugins = configFileRawOptions.plugins || [];
            var configFileRulesConfig = convertRulesConfigToFlatPath(configFileRawOptions.rules);
            var configFileFilterRulesConfig = convertRulesConfigToFlatPath(configFileRawOptions.filters);
            // => Options
            var optionRules = options.rules || [];
            var optionFilterRules = options.filterRules || [];
            var optionDisbaledRules = options.disabledRules || [];
            var optionDisbaledFilterRules = options.disabledFilterRules || [];
            var optionRulesConfig = options.rulesConfig || {};
            var optionFilterRulesConfig = options.filterRulesConfig || {};
            var optionPlugins = options.plugins || [];
            var optionPresets = options.presets || [];
            // => Merge options and configFileOptions
            // Priority options > configFile
            var rules = concat(optionRules, configRulesObject.available);
            var disabledRules = concat(optionDisbaledRules, configRulesObject.disable);
            var filterRules = concat(optionFilterRules, configFilterRulesObject.available);
            var disabledFilterRules = concat(optionDisbaledFilterRules, configFilterRulesObject.disable);
            var rulesConfig = objectAssign({}, configFileRulesConfig, optionRulesConfig);
            var filterRulesConfig = objectAssign({}, configFileFilterRulesConfig, optionFilterRulesConfig);
            var plugins = concat(optionPlugins, configFilePlugins);
            var presets = concat(optionPresets, configPresets);
            var mergedOptions = objectAssign({}, options, {
                rules: rules,
                disabledRules: disabledRules,
                rulesConfig: rulesConfig,
                filterRules: filterRules,
                disabledFilterRules: disabledFilterRules,
                filterRulesConfig: filterRulesConfig,
                plugins: plugins,
                presets: presets
            });
            return new this(mergedOptions);
        }
    }, {
        key: "CONFIG_FILE_NAME",

        /**
         * @return {string} rc config filename
         * it's name use as `.<name>rc`
         */
        get: function get() {
            return "textlint";
        }

        /**
         * @return {string} config package prefix
         */

    }, {
        key: "CONFIG_PACKAGE_PREFIX",
        get: function get() {
            return "textlint-config-";
        }

        /**
         * @return {string} rule package's name prefix
         */

    }, {
        key: "RULE_NAME_PREFIX",
        get: function get() {
            return "textlint-rule-";
        }

        /**
         * @return {string} filter rule package's name prefix
         */

    }, {
        key: "FILTER_RULE_NAME_PREFIX",
        get: function get() {
            return "textlint-filter-rule-";
        }

        /**
         * @return {string} rule preset package's name prefix
         */

    }, {
        key: "RULE_PRESET_NAME_PREFIX",
        get: function get() {
            return "textlint-rule-preset-";
        }

        /**
         * @return {string} plugins package's name prefix
         */

    }, {
        key: "PLUGIN_NAME_PREFIX",
        get: function get() {
            return "textlint-plugin-";
        }
    }]);

    function Config() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, Config);

        /**
         * @type {string|null} path to .textlintrc file.
         */
        this.configFile = options.configFile;
        this.rulesBaseDirectory = options.rulesBaseDirectory ? options.rulesBaseDirectory : defaultOptions.rulesBaseDirectory;
        // rule names that are defined in ,textlintrc
        var moduleResolver = new (_textlintModuleResolver || _load_textlintModuleResolver()).default(this.constructor, this.rulesBaseDirectory);
        /**
         * @type {string[]} rule key list
         * but, plugins's rules are not contained in `rules`
         * plugins's rule are loaded in TextLintEngine
         */
        this.rules = options.rules ? options.rules : defaultOptions.rules;
        /**
         * @type {string[]} rule key list
         * These rule is set `false` to options
         */
        this.disabledRules = options.disabledRules ? options.disabledRules : defaultOptions.disabledRules;
        /**
         * @type {string[]} filter rule key list
         */
        this.filterRules = options.filterRules ? options.filterRules : defaultOptions.filterRules;
        /**
         * @type {string[]} rule key list
         * These rule is set `false` to options
         */
        this.disabledFilterRules = options.disabledFilterRules ? options.disabledFilterRules : defaultOptions.disabledFilterRules;
        /**
         * @type {string[]} preset key list
         */
        this.presets = options.presets ? options.presets : defaultOptions.presets;
        // => load plugins
        // this.rules has not contain plugin rules
        // =====================
        this.plugins = options.plugins ? options.plugins : defaultOptions.plugins;
        // rulesConfig
        var pluginRulesConfig = (0, (_pluginLoader || _load_pluginLoader()).loadRulesConfig)(this.plugins, moduleResolver);
        var presetRulesConfig = (0, (_presetLoader2 || _load_presetLoader2()).default)(this.presets, moduleResolver);
        this.rulesConfig = objectAssign({}, presetRulesConfig, pluginRulesConfig, options.rulesConfig);

        // filterRulesConfig
        this.filterRulesConfig = options.filterRulesConfig || defaultOptions.filterRulesConfig;
        /**
         * @type {string[]}
         */
        this.extensions = options.extensions ? options.extensions : defaultOptions.extensions;
        // additional availableExtensions from plugin
        var additionalExtensions = (0, (_pluginLoader || _load_pluginLoader()).loadAvailableExtensions)(this.plugins, moduleResolver);
        this.extensions = this.extensions.concat(additionalExtensions);
        /**
         * @type {string[]}
         */
        this.rulePaths = options.rulePaths ? options.rulePaths : defaultOptions.rulePaths;
        /**
         * @type {string}
         */
        this.formatterName = options.formatterName ? options.formatterName : defaultOptions.formatterName;
        /**
         * @type {boolean}
         */
        this.color = options.color !== undefined ? options.color : defaultOptions.color;
        /**
         * @type {boolean}
         */
        this.cache = options.cache !== undefined ? options.cache : defaultOptions.cache;
        /**
         * @type {string}
         */
        this.cacheLocation = options.cacheLocation !== undefined ? options.cacheLocation : defaultOptions.cacheLocation;
        this._assertCacheLocation(this.cacheLocation);
    }

    _createClass(Config, [{
        key: "_assertCacheLocation",
        value: function _assertCacheLocation(locationPath) {
            var fileStats = void 0;
            try {
                fileStats = fs.lstatSync(locationPath);
            } catch (ex) {
                fileStats = null;
            }
            if (!fileStats) {
                return;
            }
            // TODO: --cache-location not supported directory
            // We should defined what is default name.
            assert(!fileStats.isDirectory(), "--cache-location doesn't support directory");
        }

        /* eslint-enable complexity */

    }, {
        key: "toJSON",
        value: function toJSON() {
            var _this = this;

            var r = Object.create(null);
            Object.keys(this).forEach(function (key) {
                if (!_this.hasOwnProperty(key)) {
                    return;
                }
                var value = _this[key];
                if (value == null) {
                    return;
                }
                r[key] = typeof value.toJSON !== "undefined" ? value.toJSON() : value;
            });
            return r;
        }
    }]);

    return Config;
}();

module.exports = Config;
//# sourceMappingURL=config.js.map