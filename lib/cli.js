// LICENSE : MIT
"use strict";
var fs = require("fs"),
    path = require("path"),
    debug = require("debug"),
    mkdirp = require("mkdirp");
var options = require("./options");
var CLIEngine = require("./cli-engine");
/*
    cli.js is command line **interface**

    processing role is cli-engine.js.
    @see cli-engine.js
 */
debug = debug("text:cli");

/**
 * Print results of lining text.
 * @param {string} output the output text which is formatted by {@link CLIEngine.formatResults}
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
            console.error("Cannot write to output file path, it is a directory: %s", outputFile);
            return false;
        }

        try {
            mkdirp.sync(path.dirname(filePath));
            fs.writeFileSync(filePath, output);
        } catch (ex) {
            console.error("There was a problem writing the output file:\n%s", ex);
            return false;
        }
    } else {
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
 * @param {TextLintResult[]} results The results to calculate from.
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
 * @param {TextLintResult[]} results The results to filter.
 * @returns {TextLintResult[]} The filtered results.
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
            files;

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
            debug("Running on " + (text ? "text" : "files"));
            var engine = new CLIEngine(currentOptions);
            var results = text ? engine.executeOnText(text) : engine.executeOnFiles(files);
            var output = engine.formatResults(results);
            if (printResults(output, currentOptions)) {
                return calculateExitCode(results);
            } else {
                return 1;
            }

        }

        return 0;
    }
};

module.exports = cli;
