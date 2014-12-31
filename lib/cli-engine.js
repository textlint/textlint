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
 *
 * @param {String[]} files files to lint
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
 * If want to lint a Markdown, use it.
 * But, if you have a target file, use {@link executeOnFiles} instead of it.
 * @param markdown a markdown to lint
 * @returns {TextLintResult[]}
 */
CLIEngine.prototype.executeOnMarkdown = function (markdown) {
    setupRules(this.config);
    return [textLint.lintMarkdown(markdown)];
};
/**
 * If want to lint a plain text, use it.
 * But, if you have a target file, use {@link executeOnFiles} instead of it.
 * @param text plain text to lint
 * @returns {TextLintResult[]}
 */
CLIEngine.prototype.executeOnText = function (text) {
    setupRules(this.config);
    return [textLint.lintText(text)];
};
module.exports = CLIEngine;