// LICENSE : MIT
'use strict';
const path = require('path');
const objectAssign = require('object-assign');
const loadConfig = require('./config-loader');
const concat = require("unique-concat");
import loadRulesConfigFromPlugins from "./plugin-loader";
/**
 * Get rule keys from `.textlintrc` config object.
 * @param rulesConfig
 * @returns {string[]}
 */
function availableRuleKeys(rulesConfig) {
    if (!rulesConfig) {
        return [];
    }
    return Object.keys(rulesConfig).filter(key => {
        // ignore `false` value
        return typeof rulesConfig[key] === 'object' || rulesConfig[key] === true;
    });
}
/**
 * @type {TextLintConfig}
 */
const defaultOptions = Object.freeze({
    // rule package names
    rules: [],
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
    formatterName: 'stylish'
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
        let options = {};
        options.extensions = cliOptions.ext ? cliOptions.ext : defaultOptions.extensions;
        options.rules = cliOptions.rule ? cliOptions.rule : defaultOptions.rules;
        options.plugins = cliOptions.plugin ? cliOptions.plugin : defaultOptions.plugins;
        options.configFile = cliOptions.config ? cliOptions.config : defaultOptions.configFile;
        options.rulePaths = cliOptions.rulesdir ? cliOptions.rulesdir : defaultOptions.rulePaths;
        options.formatterName = cliOptions.format ? cliOptions.format : defaultOptions.formatterName;
        return this.initWithAutoLoading(options);
    }

    // load config and merge options.
    static initWithAutoLoading(options = {}) {
        // configFile is optional
        // => load .textlintrc
        // ===================
        const configFileRawOptions = loadConfig(options.configFile, {
                configPackagePrefix: this.CONFIG_PACKAGE_PREFIX,
                configFileName: this.CONFIG_FILE_NAME
            }) || {};
        const configFileRules = availableRuleKeys(configFileRawOptions.rules);
        const configFilePlugins = configFileRawOptions.plugins || [];
        const configFileRulesConfig = configFileRawOptions.rules;
        // @type {string[]} rules rules is key list of rule names
        const optionRules = options.rules || [];
        const optionRulesConfig = options.rulesConfig || {};
        const optionPlugins = options.plugins || [];
        // merge options and configFileOptions
        // Priority options > configFile
        const rules = concat(optionRules, configFileRules);
        const rulesConfig = objectAssign({}, configFileRulesConfig, optionRulesConfig);
        const plugins = concat(optionPlugins, configFilePlugins);
        const mergedOptions = objectAssign({}, options, {
            rules,
            rulesConfig,
            plugins
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
        this.rulesBaseDirectory = options.rulesBaseDirectory ? options.rulesBaseDirectory
            : defaultOptions.rulesBaseDirectory;
        // rule names that are defined in ,textlintrc
        /**
         * @type {string[]} rule key list
         */
        this.rules = options.rules ? options.rules : defaultOptions.rules;

        // => load plugins
        // this.rules has not contain plugin rules
        // =====================
        this.plugins = options.plugins ? options.plugins : defaultOptions.plugins;
        const pluginRulesConfig = loadRulesConfigFromPlugins(this.plugins, {
            baseDir: this.rulesBaseDirectory,
            pluginPrefix: this.constructor.PLUGIN_NAME_PREFIX
        });
        this.rulesConfig = objectAssign({}, pluginRulesConfig, options.rulesConfig);
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
    }

    toJSON() {
        let r = Object.create(null);
        Object.keys(this).forEach(key => {
            if (!this.hasOwnProperty(key)) {
                return;
            }
            const value = this[key];
            if (value == null) {
                return;
            }
            r[key] = typeof value.toJSON !== 'undefined' ? value.toJSON() : value;
        });
        return r;
    }
}
module.exports = Config;
