// LICENSE : MIT
"use strict";

var textLint = require("./textlint");
var fileTraverse = require("./util/traverse");
var Config = require("./config/config");
var fs = require("fs"),
    path = require("path");
var debug = require("debug")("text:cli-engine");
/**
 * Process files are wanted to lint.
 * CLIEngine is wrapper of textlint.js.
 * Aim to be called from cli with cli options.
 * @param {object|Config} options the options is command line options or Config object.
 * @constructor
 */
function CLIEngine(options) {
    if (options instanceof Config) {
        this.config = options;
    } else {
        this.config = new Config(options);
    }
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

/**
 * format {@link results} and return output text.
 * @param {TextLintResult[]} results the collection of result
 * @returns {string} formatted output text
 * @example
 *  console.log(formatResults(results));
 */
CLIEngine.prototype.formatResults = function (results) {
    var formatterPath;
    var formatName = this.config.formatName;
    if (fs.existsSync(formatName)) {
        formatterPath = formatName;
    } else if (fs.existsSync(path.resolve(process.cwd(), formatName))) {
        formatterPath = path.resolve(process.cwd(), formatName);
    } else {
        formatterPath = path.join(__dirname, "/formatters/", formatName);
    }
    try {
        var formatter = require(formatterPath);
    } catch (ex) {
        throw new Error("Could not find formatter " + formatName + "\n" + ex);
    }
    return textLint.formatResults(results, formatter);
};

module.exports = CLIEngine;