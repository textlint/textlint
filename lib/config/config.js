// LICENSE : MIT
"use strict";
var path = require("path");
var objectAssign = require("object-assign");
var loadConfig = require("./config-loader");
function availableRuleKeys(rulesConfig) {
    return Object.keys(rulesConfig).filter(function (key) {
        // ignore `false` value
        return typeof rulesConfig[key] === "object" ||
            rulesConfig[key] === true;
    });
}
/**
 * @type {TextLintConfig}
 */
var defaultOptions = {
    // rule package names
    rules: [],
    // ".textlint" file path
    configFile: null,
    // rules config object
    rulesConfig: {},
    // rule directories
    rulePaths: [],
    extensions: [".md", ".mdk", ".markdown", ".mkdn", ".txt"],
    // formatter-file-name
    // e.g.) stylish.js => set "stylish"
    formatterName: "stylish"
};

/**
 * initialize with options.
 * @param {TextLintConfig} options the option object is defined as TextLintConfig.
 * @returns {Config}
 * @constructor
 */
function Config(options) {
    if (typeof options !== "object") {
        return objectAssign(this, defaultOptions);
    }
    /**
     * @type {string|null}
     */
    this.configFile = options.configFile;
    var userConfig = loadConfig(this.configFile);
    // rule names
    var ruleKeys = userConfig.rules ? availableRuleKeys(userConfig.rules) : [];
    /**
     * @type {string[]}
     */
    this.extensions = options.extensions ? options.extensions : defaultOptions.extensions;
    /**
     * @type {string[]}
     */
    this.rules = options.rules ? options.rules : defaultOptions.rules;
    this.rules = this.rules.concat(ruleKeys);
    /**
     * @type {object}
     */
    this.rulesConfig = options.rulesConfig ? options.rulesConfig : defaultOptions.rulesConfig;

    /**
     * @type {string[]}
     */
    this.rulePaths = options.rulePaths ? options.rulePaths : defaultOptions.rulePaths;
    /**
     * @type {string}
     */
    this.formatterName = options.formatterName ? options.formatterName : defaultOptions.formatterName;
}
/**
 * Create config object form command line options
 * See options.js
 * @param {object} cliOptions the options is command line option object. @see options.js
 * @returns {Config}
 */
Config.initWithCLIOptions = function (cliOptions) {
    var options = {};
    options.extensions = cliOptions.ext ? cliOptions.ext : defaultOptions.extensions;
    options.rules = cliOptions.rule ? cliOptions.rule : defaultOptions.rules;
    options.configFile = cliOptions.config ? cliOptions.config : defaultOptions.configFile;
    options.rulePaths = cliOptions.rulesdir ? cliOptions.rulesdir : defaultOptions.rulePaths;
    options.formatterName = cliOptions.format ? cliOptions.format : defaultOptions.formatterName;
    return new Config(options);
};

module.exports = Config;
