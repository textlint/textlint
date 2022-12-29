// LICENSE : MIT
"use strict";
import { TextlintFixResult } from "@textlint/kernel";
import { throwWithoutExperimental } from "@textlint/feature-flag";
import debug0 from "debug";
import { options } from "./options";
import { TextLintEngine } from "./textlint-engine";
import { TextFixEngine } from "./textfix-engine";
import { Config } from "./config/config";
import { createConfigFile } from "./config/config-initializer";
import { TextLintFixer } from "./fixer/textlint-fixer";
import { Logger } from "./util/logger";
import { lintParallel } from "./parallel/lint-worker-master";
import { printResults, showEmptyRuleWarning } from "./cli-util";

const debug = debug0("textlint:cli");

/*
 cli.js is command line **interface**

 processing role is cli-engine.js.
 @see cli-engine.js
 */

/**
 * Encapsulates all CLI behavior for eslint. Makes it easier to test as well as
 * for other Node.js programs to effectively run the CLI.
 */
export const cli = {
    /**
     * Executes the CLI based on an array of arguments that is passed in.
     * @param {string|string[]} args The arguments to process.
     * @param {string} [text] The text to lint (used for TTY).
     * @returns {Promise<number>} The exit code for the operation.
     */
    execute(args: string | Array<string>, text?: string): Promise<number> {
        let currentOptions;
        // version from package.json
        const pkgConf = require("read-pkg-up");
        const version = pkgConf.sync({ cwd: __dirname }).pkg.version;
        try {
            currentOptions = options.parse(args);
        } catch (error) {
            Logger.error(error);
            return Promise.resolve(1);
        }
        const files = currentOptions._;
        if (currentOptions.version) {
            Logger.log(`v${version}`);
        } else if (currentOptions.init) {
            return createConfigFile({
                dir: process.cwd(),
                verbose: !currentOptions.quiet
            });
        } else if (currentOptions.help || (!files.length && !text)) {
            Logger.log(options.generateHelp());
        } else {
            // specify file name of stdin content
            const stdinFilename = currentOptions.stdinFilename;
            debug(`textlint --version: ${version}`);
            debug(`Running on ${text ? "text" : "files"}, stdin-filename: ${stdinFilename}`);
            if (currentOptions.parallel) {
                debug("textlint --parallel");
                throwWithoutExperimental(
                    "--parallel is experimental feature. It should be used with --experimental flag"
                );
                return this.executeWithParallel(currentOptions, files);
            }
            return this.executeWithOptions(currentOptions, files, text, stdinFilename);
        }
        return Promise.resolve(0);
    },

    /**
     * execute with cli options
     * @param {object} cliOptions
     * @param {string[]} files files are file path list
     * @returns {Promise<number>} exit status
     */
    executeWithParallel(cliOptions: any, files: string[]): Promise<number> {
        const config = Config.initWithCLIOptions(cliOptions);
        if (cliOptions.fix) {
            // --fix
            const fixEngine = new TextFixEngine(config);
            if (!fixEngine.hasRuleAtLeastOne()) {
                showEmptyRuleWarning();
                return Promise.resolve(1);
            }
            const resultsPromise = lintParallel(files, {
                type: "fix",
                config: config,
                concurrency: cliOptions.maxConcurrency
            });
            return resultsPromise.then((results) => {
                debug("fix results: %j", results);
                const fixer = new TextLintFixer();
                const output = fixEngine.formatResults(results);
                printResults(output, cliOptions);
                // --dry-run
                if (cliOptions.dryRun) {
                    debug("Enable dry-run mode");
                    return Promise.resolve(0);
                }
                // modify file and return exit status
                return fixer.write(results as TextlintFixResult[]).then(() => {
                    return 0;
                });
            });
        }
        // lint as default
        const lintEngine = new TextLintEngine(config);
        if (!lintEngine.hasRuleAtLeastOne()) {
            showEmptyRuleWarning();
            return Promise.resolve(1);
        }
        const resultsPromise = lintParallel(files, {
            type: "lint",
            config: config,
            concurrency: cliOptions.maxConcurrency
        });
        return resultsPromise.then((results) => {
            debug("lint results: %j", results);
            const output = lintEngine.formatResults(results);
            if (printResults(output, cliOptions)) {
                return lintEngine.isErrorResults(results) ? 1 : 0;
            } else {
                return 1;
            }
        });
    },

    /**
     * execute with cli options
     * @param {object} cliOptions
     * @param {string[]} files files are file path list
     * @param {string} [text]
     * @param {string} [stdinFilename]
     * @returns {Promise<number>} exit status
     */
    executeWithOptions(cliOptions: any, files: string[], text?: string, stdinFilename?: string): Promise<number> {
        const config = Config.initWithCLIOptions(cliOptions);
        if (cliOptions.fix) {
            // --fix
            const fixEngine = new TextFixEngine(config);
            if (!fixEngine.hasRuleAtLeastOne()) {
                showEmptyRuleWarning();
                return Promise.resolve(1);
            }
            const resultsPromise = text
                ? fixEngine.executeOnText(text, stdinFilename)
                : fixEngine.executeOnFiles(files);
            return resultsPromise.then((results) => {
                debug("fix results: %j", results);
                const fixer = new TextLintFixer();
                const output = fixEngine.formatResults(results);
                printResults(output, cliOptions);
                // --dry-run
                if (cliOptions.dryRun) {
                    debug("Enable dry-run mode");
                    return Promise.resolve(0);
                }
                // modify file and return exit status
                return fixer.write(results as TextlintFixResult[]).then(() => {
                    return 0;
                });
            });
        }
        // lint as default
        const lintEngine = new TextLintEngine(config);
        if (!lintEngine.hasRuleAtLeastOne()) {
            showEmptyRuleWarning();
            return Promise.resolve(1);
        }
        const resultsPromise = text ? lintEngine.executeOnText(text, stdinFilename) : lintEngine.executeOnFiles(files);
        return resultsPromise.then((results) => {
            debug("lint results: %j", results);
            const output = lintEngine.formatResults(results);
            if (printResults(output, cliOptions)) {
                return lintEngine.isErrorResults(results) ? 1 : 0;
            } else {
                return 1;
            }
        });
    }
};
