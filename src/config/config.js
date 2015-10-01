// LICENSE : MIT
'use strict';
const path = require('path');
const objectAssign = require('object-assign');
const loadConfig = require('./config-loader');
/**
 * Get rule keys from textlintrc config object.
 * @param rulesConfig
 * @returns {string[]}
 */
function availableRuleKeys(rulesConfig) {
    return Object.keys(rulesConfig).filter(key => {
        // ignore `false` value
        return typeof rulesConfig[key] === 'object' || rulesConfig[key] === true;
    });
}
/**
 * @type {TextLintConfig}
 */
const defaultOptions = {
    // rule package names
    rules: [],
    // rules base directory that is related `rules`.
    rulesBaseDirectory: null,
    // ".textlint" file path
    configFile: null,
    // rules config object
    rulesConfig: {},
    // rule directories
    rulePaths: [],
    extensions: [
        '.md',
        '.mdk',
        '.markdown',
        '.mkdn',
        '.txt'
    ],
    // formatter-file-name
    // e.g.) stylish.js => set "stylish"
    formatterName: 'stylish'
};
class Config {
    /**
     * initialize with options.
     * @param {TextLintConfig} options the option object is defined as TextLintConfig.
     * @returns {Config}
     * @constructor
     */
    constructor(options) {
        if (typeof options === 'undefined') {
            return objectAssign(this, defaultOptions);
        }
        // TODO: add `noUseConfig` option
        // configFile is optional
        const userConfig = loadConfig(options.configFile);
        /**
         * @type {object}
         */
        this.rulesConfig = userConfig.rules ? userConfig.rules : defaultOptions.rulesConfig;
        /**
         * @type {string|null} path to .textlintrc file.
         */
        this.configFile = userConfig.config ? userConfig.config : options.configFile;
        // rule names
        const ruleKeys = availableRuleKeys(this.rulesConfig);
        /**
         * @type {string[]}
         */
        this.rules = options.rules ? options.rules : defaultOptions.rules;
        this.rules = this.rules.concat(ruleKeys);
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
/**
 * Create config object form command line options
 * See options.js
 * @param {object} cliOptions the options is command line option object. @see options.js
 * @returns {Config}
 */
Config.initWithCLIOptions = function (cliOptions) {
    let options = {};
    options.extensions = cliOptions.ext ? cliOptions.ext : defaultOptions.extensions;
    options.rules = cliOptions.rule ? cliOptions.rule : defaultOptions.rules;
    options.configFile = cliOptions.config ? cliOptions.config : defaultOptions.configFile;
    options.rulePaths = cliOptions.rulesdir ? cliOptions.rulesdir : defaultOptions.rulePaths;
    options.formatterName = cliOptions.format ? cliOptions.format : defaultOptions.formatterName;
    return new Config(options);
};
module.exports = Config;