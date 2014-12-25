// LICENSE : MIT
"use strict";
var fs = require("fs"),
    path = require("path"),
    debug = require("debug"),
    options = require("./options");

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

debug = debug("textlint:cli");

function printResults(results, format, config) {
    var formatter,
        formatterPath,
        output;

    if (fs.existsSync(path.resolve(process.cwd(), format))) {
        formatterPath = path.resolve(process.cwd(), format);
    } else {
        formatterPath = path.join(__dirname, "/formatters/", format);
    }
    try {
        formatter = require(formatterPath);
    } catch (ex) {
        console.error("Could not find formatter '%s' : %s.", format, ex);
        return false;
    }

    output = formatter(results, config);

    if (output) {
        console.log(output);
    }

    return true;

}

/**
 * Checks if the given message is an error message.
 * @param {object} message The message to check.
 * @returns {boolean} Whether or not the message is an error message.
 */
function isErrorMessage(message) {
    return message.severity === 2;
}

/**
 * Calculates the exit code for ESLint. If there is even one error then the
 * exit code is 1.
 * @param {LintResult[]} results The results to calculate from.
 * @returns {int} The exit code to use.
 * @private
 */
function calculateExitCode(results) {
    return results.some(function (result) {
        return result.messages.some(isErrorMessage);
    }) ? 1 : 0;
}

/**
 * Returns results that only contains errors.
 * @param {LintResult[]} results The results to filter.
 * @returns {LintResult[]} The filtered results.
 */
function getErrorResults(results) {
    var filtered = [];

    results.forEach(function (result) {
        var filteredMessages = result.messages.filter(isErrorMessage);

        if (filteredMessages.length > 0) {
            filtered.push({
                filePath: result.filePath,
                messages: filteredMessages
            });
        }
    });

    return filtered;
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

/**
 * Encapsulates all CLI behavior for eslint. Makes it easier to test as well as
 * for other Node.js programs to effectively run the CLI.
 */
var cli = {

    /**
     * Executes the CLI based on an array of arguments that is passed in.
     * @param {string|Array|Object} args The arguments to process.
     * @param {string} [text] The text to lint (used for TTY).
     * @returns {int} The exit code for the operation.
     */
    execute: function (args, text) {

        var currentOptions,
            files,
            result;

        try {
            currentOptions = options.parse(args);
        } catch (error) {
            console.error(error.message);
            return 1;
        }

        files = currentOptions._;

        if (currentOptions.version) { // version from package.json
            console.log("v" + require("../package.json").version);
        } else if (currentOptions.help || (!files.length && !text)) {
            console.log(options.generateHelp());
        } else {
            //engine = new CLIEngine(translateOptions(currentOptions));
            debug("Running on " + (text ? "text" : "files"));
            var api = require("./textlint");
            var loadRules = require("../lib/load-rules");
            var rules = loadRules(path.join(__dirname, "rules"));
            api.setupRules(rules);
            result = api.lintFile(files[0]);
            if (printResults([result], currentOptions.format)) {
                return calculateExitCode([result]);
            } else {
                return 1;
            }

        }

        return 0;
    }
};

module.exports = cli;
