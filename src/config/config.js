// LICENSE : MIT
"use strict";
const objectAssign = require("object-assign");
const concat = require("unique-concat");
const loadConfig = require("./config-loader");
import {isPluginRuleKey, isPresetRuleKey} from "../util/config-util";
import {mapRulesConfig} from "./preset-loader";
import loadRulesConfigFromPlugins from "./plugin-loader";
import loadRulesConfigFromPresets from "./preset-loader";
import TextLintModuleResolver from "../engine/textlint-module-resolver";
/**
 * Get rule keys from `.textlintrc` config object.
 * @param rulesConfig
 * @returns {{available: string[], disable: string[]}}
 */
function separateAvailableOrDisable(rulesConfig) {
    const ruleOf = {
        presets: [],
        available: [],
        disable: []
    };
    if (!rulesConfig) {
        return ruleOf;
    }
    Object.keys(rulesConfig).forEach(key => {
        // `textlint-rule-preset-XXX`
        if (isPresetRuleKey(key)) {
            if (typeof rulesConfig[key] === "object" || rulesConfig[key] === true) {
                ruleOf.presets.push(key);
            }
            return;
        }
        // `<plugin>/<rule-key>` should ignored
        if (isPluginRuleKey(key)) {
            return;
        }
        // ignore `false` value
        if (typeof rulesConfig[key] === "object" || rulesConfig[key] === true) {
            ruleOf.available.push(key);
        } else {
            ruleOf.disable.push(key);
        }
    });
    return ruleOf;
}
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
    const filteredConfig = {};
    Object.keys(rulesConfig).forEach(key => {
        if (isPresetRuleKey(key)) {
            // <preset>/<rule>
            objectAssign(filteredConfig, mapRulesConfig(rulesConfig[key], key));
            return;
        }
        filteredConfig[key] = rulesConfig[key];
    });
    return filteredConfig;
}
/**
 * @type {TextLintConfig}
 */
const defaultOptions = Object.freeze({
    // rule package names
    rules: [],
    // disabled rule package names
    // always should start with empty
    disabledRules: [],
    // preset package names
    // e.g.) ["preset-foo"]
    presets: [],
    // plugin package names
    plugins: [],
    // rules base directory that is related `rules`.
    rulesBaseDirectory: undefined,
    // ".textlint" file path
    configFile: undefined,
    // rules config object
    rulesConfig: {},
    // rule directories
    rulePaths: [],
    extensions: [],
    // formatter-file-name
    // e.g.) stylish.js => set "stylish"
    formatterName: "stylish",
    // --no-color
    color: true
});

// Priority: CLI > Code options > config file
class Config {
    /**
     * @return {string} rc config filename
     * it's name use as `.<name>rc`
     */
    static get CONFIG_FILE_NAME() {
        return "textlint";
    }

    /**
     * @return {string} config package prefix
     */
    static get CONFIG_PACKAGE_PREFIX() {
        return "textlint-config-";
    }

    /**
     * @return {string} rule package's name prefix
     */
    static get RULE_NAME_PREFIX() {
        return "textlint-rule-";
    }

    /**
     * @return {string} rule preset package's name prefix
     */
    static get RULE_PRESET_NAME_PREFIX() {
        return "textlint-rule-preset-";
    }

    /**
     * @return {string} plugins package's name prefix
     */
    static get PLUGIN_NAME_PREFIX() {
        return "textlint-plugin-";
    }

    /**
     * Create config object form command line options
     * See options.js
     * @param {object} cliOptions the options is command line option object. @see options.js
     * @returns {Config}
     */
    static initWithCLIOptions(cliOptions) {
        const options = {};
        options.extensions = cliOptions.ext ? cliOptions.ext : defaultOptions.extensions;
        options.rules = cliOptions.rule ? cliOptions.rule : defaultOptions.rules;
        // TODO: CLI --disable <rule>?
        options.disabledRules = defaultOptions.disabledRules;
        options.presets = cliOptions.preset ? cliOptions.preset : defaultOptions.presets;
        options.plugins = cliOptions.plugin ? cliOptions.plugin : defaultOptions.plugins;
        options.configFile = cliOptions.config ? cliOptions.config : defaultOptions.configFile;
        options.rulePaths = cliOptions.rulesdir ? cliOptions.rulesdir : defaultOptions.rulePaths;
        options.formatterName = cliOptions.format ? cliOptions.format : defaultOptions.formatterName;
        options.color = cliOptions.color !== undefined ? cliOptions.color : defaultOptions.color;
        return this.initWithAutoLoading(options);
    }

    // load config and merge options.
    static initWithAutoLoading(options = {}) {
        // => ConfigFile
        // configFile is optional
        // => load .textlintrc
        const configFileRawOptions = loadConfig(options.configFile, {
                configPackagePrefix: this.CONFIG_PACKAGE_PREFIX,
                configFileName: this.CONFIG_FILE_NAME
            }) || {};
        const configRulesObject = separateAvailableOrDisable(configFileRawOptions.rules);
        // available rules
        const configFileRules = configRulesObject.available;
        // disable rules
        const configFileDisabledRules = configRulesObject.disable;
        const configPresets = configRulesObject.presets;
        const configFilePlugins = configFileRawOptions.plugins || [];
        const configFileRulesConfig = convertRulesConfigToFlatPath(configFileRawOptions.rules);
        // => Options
        const optionRules = options.rules || [];
        const optionDisbaledRules = options.disabledRules || [];
        const optionRulesConfig = options.rulesConfig || {};
        const optionPlugins = options.plugins || [];
        const optionPresets = options.presets || [];
        // => Merge options and configFileOptions
        // Priority options > configFile
        const rules = concat(optionRules, configFileRules);
        const disabledRules = concat(optionDisbaledRules, configFileDisabledRules);
        const rulesConfig = objectAssign({}, configFileRulesConfig, optionRulesConfig);
        const plugins = concat(optionPlugins, configFilePlugins);
        const presets = concat(optionPresets, configPresets);
        const mergedOptions = objectAssign({}, options, {
            rules,
            disabledRules,
            rulesConfig,
            plugins,
            presets
        });
        return new this(mergedOptions);
    }

    /**
     * initialize with options.
     * @param {TextLintConfig} options the option object is defined as TextLintConfig.
     * @returns {Config}
     * @constructor
     */
    constructor(options = {}) {

        /**
         * @type {string|null} path to .textlintrc file.
         */
        this.configFile = options.configFile;
        this.rulesBaseDirectory = options.rulesBaseDirectory
            ? options.rulesBaseDirectory
            : defaultOptions.rulesBaseDirectory;
        // rule names that are defined in ,textlintrc
        const moduleResolver = new TextLintModuleResolver(this.constructor, this.rulesBaseDirectory);

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
         * @type {string[]} preset key list
         */
        this.presets = options.presets ? options.presets : defaultOptions.presets;
        // => load plugins
        // this.rules has not contain plugin rules
        // =====================
        this.plugins = options.plugins ? options.plugins : defaultOptions.plugins;
        const pluginRulesConfig = loadRulesConfigFromPlugins(this.plugins, {
            baseDir: this.rulesBaseDirectory,
            pluginPrefix: this.constructor.PLUGIN_NAME_PREFIX
        });
        const presetRulesConfig = loadRulesConfigFromPresets(this.presets, moduleResolver);
        this.rulesConfig = objectAssign({}, presetRulesConfig, pluginRulesConfig, options.rulesConfig);
        /**
         * @type {string[]}
         */
        this.extensions = options.extensions ? options.extensions : defaultOptions.extensions;
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
    }

    toJSON() {
        const r = Object.create(null);
        Object.keys(this).forEach(key => {
            if (!this.hasOwnProperty(key)) {
                return;
            }
            const value = this[key];
            if (value == null) {
                return;
            }
            r[key] = typeof value.toJSON !== "undefined" ? value.toJSON() : value;
        });
        return r;
    }
}
module.exports = Config;
