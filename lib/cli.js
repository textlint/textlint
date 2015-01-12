// LICENSE : MIT
"use strict";
var fs = require("fs"),
    path = require("path"),
    debug = require("debug"),
    mkdirp = require("mkdirp");
var options = require("./options");
var TextLintEngine = require("./textlint-engine");
var Config = require("./config/config");
/*
    cli.js is command line **interface**

    processing role is cli-engine.js.
    @see cli-engine.js
 */
debug = debug("text:cli");

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
            var config = Config.initWithCLIOptions(currentOptions);
            var engine = new TextLintEngine(config);
            var results = text ? engine.executeOnText(text) : engine.executeOnFiles(files);
            var output = engine.formatResults(results);
            if (printResults(output, currentOptions)) {
                return engine.isErrorResults(results) ? 1 : 0;
            } else {
                return 1;
            }

        }

        return 0;
    }
};

module.exports = cli;
