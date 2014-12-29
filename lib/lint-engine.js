// LICENSE : MIT
"use strict";

var textLint = require("./textlint");
var fileTraverse = require("./util/traverse");
var Config = require("./config/config");

var debug = require("debug")("text:lint");
/**
 * LintEngine process files are wanted to lint.
 * LintEngine is wrapper of textlint.js.
 * @param {object} options - cli option object
 * @constructor
 */
function LintEngine(options) {
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
        config.rulePaths.forEach(function(rulesdir) {
            debug("Loading rules from %o", rulesdir);
            ruleManger.loadRules(rulesdir);
        });
    }
    textLint.setupRules(ruleManger.getAllRules());
}
/**
 *
 * @param files
 * @returns {[TextLintResult]}
 */
LintEngine.prototype.executeOnFiles = function (files) {
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
LintEngine.prototype.executeOnText = function (text) {
    setupRules(this.config);
    return [textLint.lintText(text)];
};
module.exports = LintEngine;