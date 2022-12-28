// LICENSE : MIT
import debug0 from "debug";
// @ts-expect-error
import mkdirp from "mkdirp";
import { CliOptions, options } from "./options";
import { createConfigFile } from "./config/config-initializer";
import { TextLintFixer } from "./fixer/textlint-fixer";
import { Logger } from "./util/logger";
import { loadTextlintrc } from "./loader/TextlintrcLoader";
import { loadCliDescriptor } from "./loader/CliLoader";
import { createLinter, mergeDescriptors } from "./createTextlint";
import { loadFormatter as loadFixerFormatter } from "@textlint/fixer-formatter";
import { loadFormatter as loadLinterFormatter } from "@textlint/linter-formatter";
import { SeverityLevel } from "./shared/type/SeverityLevel";
import { printResults, showEmptyRuleWarning } from "./cli-util";

const debug = debug0("textlint:cli");
type StdinExecuteOption = {
    cliOptions: CliOptions;
    text: string;
    stdinFilename: string;
};
type ExceutOtptions =
    | {
          cliOptions: CliOptions;
          files: string[];
      }
    | StdinExecuteOption;
const isStdinExecution = (executeOptions: ExceutOtptions): executeOptions is StdinExecuteOption => {
    return "text" in executeOptions;
};

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
    async execute(args: string | Array<string>, text?: string): Promise<number> {
        let currentOptions;
        // version from package.json
        const pkgConf = await import("read-pkg-up");
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
            if (text) {
                if (!stdinFilename) {
                    throw new Error("Please specify --stdin-filename option");
                }
                return this.executeWithOptions({
                    cliOptions: currentOptions,
                    text,
                    stdinFilename
                });
            } else {
                return this.executeWithOptions({
                    cliOptions: currentOptions,
                    files
                });
            }
        }
        return Promise.resolve(0);
    },

    /**
     * execute with cli options
     * @returns {Promise<number>} exit status
     */
    async executeWithOptions(executeOptions: ExceutOtptions): Promise<number> {
        const cliOptions = executeOptions.cliOptions;
        const textlintrcDescriptor = await loadTextlintrc({
            configFilePath: cliOptions.config,
            rulesBaseDirectory: cliOptions.rulesBaseDirectory
        });
        const cliDescriptor = await loadCliDescriptor(cliOptions);
        const descriptor = mergeDescriptors(textlintrcDescriptor, cliDescriptor);
        const hasRuleAtLeastOne = descriptor.rule.lintableDescriptors.length > 0;
        if (!hasRuleAtLeastOne) {
            showEmptyRuleWarning();
            return Promise.resolve(1);
        }
        const linter = createLinter({
            cache: cliOptions.cache,
            cacheLocation: cliOptions.cacheLocation,
            quiet: cliOptions.quiet,
            descriptor
        });
        if (cliOptions.fix) {
            // --fix
            const results = isStdinExecution(executeOptions)
                ? [await linter.fixText(executeOptions.text, executeOptions.stdinFilename)]
                : await linter.fixFiles(executeOptions.files);
            debug("fix results: %j", results);
            const fixer = new TextLintFixer();
            const formatter = await loadFixerFormatter({
                formatterName: cliOptions.format,
                color: cliOptions.color
            });
            const output = formatter.format(results);
            // --dry-run
            if (cliOptions.dryRun) {
                debug("Enable dry-run mode");
                return Promise.resolve(0);
            }
            // modify file and return exit status
            await fixer.write(results);
            if (printResults(output, cliOptions)) {
                const hasErrorMessage = results.some((result) => {
                    return result.messages.some((message) => message.severity === SeverityLevel.error);
                });
                return hasErrorMessage ? 1 : 0;
            } else {
                return 1;
            }
        } else {
            // lint as default
            const results = isStdinExecution(executeOptions)
                ? [await linter.lintText(executeOptions.text, executeOptions.stdinFilename)]
                : await linter.lintFiles(executeOptions.files);
            debug("lint results: %j", results);
            const formatter = await loadLinterFormatter({
                formatterName: cliOptions.format,
                color: cliOptions.color
            });
            const output = formatter.format(results);
            printResults(output, cliOptions);
            if (printResults(output, cliOptions)) {
                const hasErrorMessage = results.some((result) => {
                    return result.messages.some((message) => message.severity === SeverityLevel.error);
                });
                return hasErrorMessage ? 1 : 0;
            } else {
                return 1;
            }
        }
    }
};
