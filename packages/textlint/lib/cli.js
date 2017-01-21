// LICENSE : MIT
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _options;

function _load_options() {
    return _options = _interopRequireDefault(require("./options"));
}

var _textlintEngine;

function _load_textlintEngine() {
    return _textlintEngine = _interopRequireDefault(require("./textlint-engine"));
}

var _textfixEngine;

function _load_textfixEngine() {
    return _textfixEngine = _interopRequireDefault(require("./textfix-engine"));
}

var _config;

function _load_config() {
    return _config = _interopRequireDefault(require("./config/config"));
}

var _configInitializer;

function _load_configInitializer() {
    return _configInitializer = _interopRequireDefault(require("./config/config-initializer"));
}

var _textlintFixer;

function _load_textlintFixer() {
    return _textlintFixer = _interopRequireDefault(require("./fixer/textlint-fixer"));
}

var _logger;

function _load_logger() {
    return _logger = _interopRequireDefault(require("./util/logger"));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Promise = require("bluebird");
var fs = require("fs");
var path = require("path");
var debug = require("debug")("textlint:cli");
var mkdirp = require("mkdirp");

/*
 cli.js is command line **interface**

 processing role is cli-engine.js.
 @see cli-engine.js
 */

/** @typedef {Object} TextLintFormatterOption
 *  @property {string} formatterName
 *  @property {boolean} noColor
 */

/**
 * Print results of lining text.
 * @param {string} output the output text which is formatted by {@link TextLintEngine.formatResults}
 * @param {object} options cli option object {@lint ./options.js}
 * @returns {boolean} does print result success?
 */
function printResults(output, options) {
    if (!output) {
        return true;
    }
    var outputFile = options.outputFile;
    if (outputFile) {
        var filePath = path.resolve(process.cwd(), outputFile);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
            (_logger || _load_logger()).default.error("Cannot write to output file path, it is a directory: %s", outputFile);
            return false;
        }
        try {
            mkdirp.sync(path.dirname(filePath));
            fs.writeFileSync(filePath, output);
        } catch (ex) {
            (_logger || _load_logger()).default.error("There was a problem writing the output file:\n%s", ex);
            return false;
        }
    } else {
        (_logger || _load_logger()).default.log(output);
    }
    return true;
}

/**
 * Encapsulates all CLI behavior for eslint. Makes it easier to test as well as
 * for other Node.js programs to effectively run the CLI.
 */
var cli = {
    /**
     * Executes the CLI based on an array of arguments that is passed in.
     * @param {string|Array|Object} args The arguments to process.
     * @param {string} [text] The text to lint (used for TTY).
     * @returns {Promise<number>} The exit code for the operation.
     */
    execute: function execute(args, text) {
        var currentOptions;
        try {
            currentOptions = (_options || _load_options()).default.parse(args);
        } catch (error) {
            (_logger || _load_logger()).default.error(error.message);
            return Promise.resolve(1);
        }
        var files = currentOptions._;
        if (currentOptions.version) {
            // version from package.json
            (_logger || _load_logger()).default.log("v" + require("../package.json").version);
        } else if (currentOptions.init) {
            return (_configInitializer || _load_configInitializer()).default.initializeConfig(process.cwd());
        } else if (currentOptions.help || !files.length && !text) {
            (_logger || _load_logger()).default.log((_options || _load_options()).default.generateHelp());
        } else {
            // specify file name of stdin content
            var stdinFilename = currentOptions.stdinFilename;
            debug("Running on " + (text ? "text" : "files") + ", stdin-filename: " + stdinFilename);
            return this.executeWithOptions(currentOptions, files, text, stdinFilename);
        }
        return Promise.resolve(0);
    },

    /**
     * execute with cli options
     * @param {object} cliOptions
     * @param {string[]} files files are file path list
     * @param {string} [text]
     * @param {string} [stdinFilename]
     * @returns {Promise<number>} exit status
     */
    executeWithOptions: function executeWithOptions(cliOptions, files, text, stdinFilename) {
        var config = (_config || _load_config()).default.initWithCLIOptions(cliOptions);
        var showEmptyRuleWarning = function showEmptyRuleWarning() {
            (_logger || _load_logger()).default.log("\n== Not have rules, textlint do not anything ==\n=> How to set rule?\nSee https://github.com/textlint/textlint/blob/master/docs/configuring.md\n");
        };

        if (cliOptions.fix) {
            var _ret = function () {
                // --fix
                var fixEngine = new (_textfixEngine || _load_textfixEngine()).default(config);
                if (!fixEngine.hasRuleAtLeastOne()) {
                    showEmptyRuleWarning();
                    return {
                        v: Promise.resolve(0)
                    };
                }
                var resultsPromise = text ? fixEngine.executeOnText(text, stdinFilename) : fixEngine.executeOnFiles(files);
                return {
                    v: resultsPromise.then(function (results) {
                        var fixer = new (_textlintFixer || _load_textlintFixer()).default();
                        var output = fixEngine.formatResults(results);
                        printResults(output, cliOptions);
                        // --dry-run
                        if (cliOptions.dryRun) {
                            debug("Enable dry-run mode.");
                            return Promise.resolve(0);
                        }
                        // modify file and return exit status
                        return fixer.write(results).then(function () {
                            return 0;
                        });
                    })
                };
            }();

            if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
        }
        // lint as default
        var lintEngine = new (_textlintEngine || _load_textlintEngine()).default(config);
        if (!lintEngine.hasRuleAtLeastOne()) {
            showEmptyRuleWarning();
            return Promise.resolve(0);
        }
        var resultsPromise = text ? lintEngine.executeOnText(text, stdinFilename) : lintEngine.executeOnFiles(files);
        return resultsPromise.then(function (results) {
            var output = lintEngine.formatResults(results);
            if (printResults(output, cliOptions)) {
                return lintEngine.isErrorResults(results) ? 1 : 0;
            } else {
                return 1;
            }
        });
    }
};
module.exports = cli;
//# sourceMappingURL=cli.js.map