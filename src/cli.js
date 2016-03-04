// LICENSE : MIT
'use strict';
const Promise = require("bluebird");
const fs = require('fs');
const path = require('path');
const debug = require('debug')('textlint:cli');
const mkdirp = require('mkdirp');
const options = require('./options');
const TextLintEngine = require('./textlint-engine');
const Config = require('./config/config');
const configInit = require('./config/config-initializer');
const TextLintFixer = require("./textlint-fixer");
/*
 cli.js is command line **interface**

 processing role is cli-engine.js.
 @see cli-engine.js
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
    const outputFile = options.outputFile;
    if (outputFile) {
        const filePath = path.resolve(process.cwd(), outputFile);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
            console.error('Cannot write to output file path, it is a directory: %s', outputFile);
            return false;
        }
        try {
            mkdirp.sync(path.dirname(filePath));
            fs.writeFileSync(filePath, output);
        } catch (ex) {
            console.error('There was a problem writing the output file:\n%s', ex);
            return false;
        }
    } else {
        console.log(output);
    }
    return true;
}

/**
 * Encapsulates all CLI behavior for eslint. Makes it easier to test as well as
 * for other Node.js programs to effectively run the CLI.
 */
const cli = {
    /**
     * Executes the CLI based on an array of arguments that is passed in.
     * @param {string|Array|Object} args The arguments to process.
     * @param {string} [text] The text to lint (used for TTY).
     * @returns {Promise<number>} The exit code for the operation.
     */
    execute(args, text) {
        var currentOptions;
        try {
            currentOptions = options.parse(args);
        } catch (error) {
            console.error(error.message);
            return Promise.resolve(1);
        }
        const files = currentOptions._;
        if (currentOptions.version) {
            // version from package.json
            console.log(`v${ require('../package.json').version }`);
        } else if (currentOptions.init) {
            return configInit.initializeConfig(process.cwd());
        } else if (currentOptions.help || !files.length && !text) {
            console.log(options.generateHelp());
        } else {
            // specify file name of stdin content
            const stdinFilename = currentOptions.stdinFilename;
            debug(`Running on ${ text ? 'text' : 'files' }, stdin-filename: ${stdinFilename}`);
            return this.executeWithOptions(currentOptions, files, text, stdinFilename);
        }
        return Promise.resolve(0);
    },
    /**
     * execute with cli options
     * @param {object} cliOptions
     * @param {string[]} files files are file path list
     * @param {string} text?
     * @param {string} stdinFilename?
     * @returns {Promise<number>} exit status
     */
    executeWithOptions(cliOptions, files, text, stdinFilename){
        const config = Config.initWithCLIOptions(cliOptions);
        const engine = new TextLintEngine(config);
        // TODO: should indirect access ruleManager
        if (!engine.ruleManager.hasRuleAtLeastOne()) {
            console.log(`
== Not have rules, textlint do not anything ==
=> How to set rule?
See https://github.com/textlint/textlint/blob/master/docs/configuring.md
`);

            return Promise.resolve(0);
        }

        if (cliOptions.fix) {
            // --fix
            const resultsPromise = text ? engine.fixText(text, stdinFilename) : engine.fixFiles(files);
            return resultsPromise.then(results => {
                const fixer = new TextLintFixer(results);
                const output = fixer.formatResults();
                printResults(output, cliOptions);
                // return exit code
                return fixer.write() ? 0 : 1;
            });
        }

        const resultsPromise = text ? engine.executeOnText(text, stdinFilename) : engine.executeOnFiles(files);
        return resultsPromise.then(results => {
            const output = engine.formatResults(results);
            if (printResults(output, cliOptions)) {
                return engine.isErrorResults(results) ? 1 : 0;
            } else {
                return 1;
            }
        });
    }
};
module.exports = cli;
