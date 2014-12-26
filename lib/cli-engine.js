// LICENSE : MIT
"use strict";

var textLint = require("./textlint");
var fileTraverse = require("./util/traverse");
var Config = require("./config/config");

var debug = require("debug")("text:lint");
/**
 *
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
    var ruleManger = require("./rule-manager");
    var rules = ruleManger.loadRules(config.rulesDir);
    textLint.setupRules(rules);
}
/**
 *
 * @param files
 * @returns {[TextLintResult]}
 */
CLIEngine.prototype.executeOnFiles = function (files) {
    setupRules(this.config);
    var targetFiles = findFiles(files, this.config);
    return targetFiles.map(function (file) {
        return textLint.lintFile(file);
    });
};
/**
 *
 * @param text
 * @returns {[TextLintResult]}
 */
CLIEngine.prototype.executeOnText = function (text) {
    setupRules(this.config);
    return [textLint.lintText(text)];
};
module.exports = CLIEngine;