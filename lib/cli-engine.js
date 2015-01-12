// LICENSE : MIT
"use strict";

var textLint = require("./textlint");
var fileTraverse = require("./util/traverse");
var Config = require("./config/config");

var debug = require("debug")("text:cli-engine");
/**
 * Process files are wanted to lint.
 * CLIEngine is wrapper of textlint.js.
 * Aim to be called from cli with cli options.
 * @param {object} options - cli option object
 * @constructor
 */
function CLIEngine(options) {
    this.config = new Config(options);
}
/**
 * filter files by config
 * @param files
 * @param {Config} config
 */
function findFiles(files, config) {
    var processed = [];
    // sync
    fileTraverse({
        files: files,
        extensions: config.extensions,
        exclude: false
    }, function (filename) {
        debug("Processing " + filename);
        processed.push(filename);
    });
    return processed;
}

/**
 * set up lint rules using {@lint Config} object.
 * The {@lint Config} object was created with initialized {@link CLIEngine} (as-known Constructor).
 * @param {Config} config the config is parsed object
 */
function setupRules(config) {
    var ruleManger = require("./rule/rule-manager");
    if (config.rulePaths) {
        // load in additional rules
        config.rulePaths.forEach(function (rulesdir) {
            debug("Loading rules from %o", rulesdir);
            ruleManger.loadRules(rulesdir);
        });
    }
    textLint.setupRules(ruleManger.getAllRules());
}
/**
 * lint file are passed as arguments..
 * @param {String[]} files file path list for lint
 * @returns {TextLintResult[]}
 */
CLIEngine.prototype.executeOnFiles = function (files) {
    setupRules(this.config);
    var targetFiles = findFiles(files, this.config);
    return targetFiles.map(function (file) {
        return textLint.lintFile(file);
    });
};

/**
 * If want to lint a text, use it.
 * But, if you have a target file, use {@link executeOnFiles} instead of it.
 * @param text plain text for lint
 * @returns {TextLintResult[]}
 * @todo specify the files format for lint by config.filetype?
 */
CLIEngine.prototype.executeOnText = function (text) {
    setupRules(this.config);
    return [textLint.lintText(text)];
};
module.exports = CLIEngine;