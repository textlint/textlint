// LICENSE : MIT
import debug0 from "debug";
import { CliOptions, options } from "./options";
import { createConfigFile } from "./config/config-initializer";
import { TextLintFixer } from "./fixer/textlint-fixer";
import { Logger } from "./util/logger";
import { loadBuiltinPlugins, loadTextlintrc } from "./loader/TextlintrcLoader";
import { loadCliDescriptor } from "./loader/CliLoader";
import { createLinter } from "./createLinter";
import { SeverityLevel } from "./shared/type/SeverityLevel";
import { printResults, showEmptyRuleWarning } from "./cli-util";
import { loadFixerFormatter, loadLinterFormatter } from "./formatter";

const debug = debug0("textlint:cli");
type StdinExecuteOption = {
    cliOptions: CliOptions;
    text: string;
    stdinFilename: string;
};
type ExecuteOptions =
    | {
          cliOptions: CliOptions;
          files: string[];
      }
    | StdinExecuteOption;
const isStdinExecution = (executeOptions: ExecuteOptions): executeOptions is StdinExecuteOption => {
    return "text" in executeOptions;
};

const loadDescriptor = async (cliOptions: CliOptions) => {
    const cliDescriptor = await loadCliDescriptor(cliOptions);
    debug("cliDescriptor: %j", cliDescriptor);
    const textlintrcDescriptor = cliOptions.textlintrc
        ? await loadTextlintrc({
              configFilePath: cliOptions.config,
              node_modulesDir: cliOptions.rulesBaseDirectory
          })
        : await loadBuiltinPlugins();
    debug("textlintrcDescriptor: %j", textlintrcDescriptor);
    const mergedDescriptor = cliDescriptor.concat(textlintrcDescriptor);
    debug("mergedDescriptor: %j", mergedDescriptor);
    return mergedDescriptor;
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
        debug("cliOptions: %j", currentOptions);
        if (currentOptions.version) {
            Logger.log(`v${version}`);
        } else if (currentOptions.init) {
            return createConfigFile({
                dir: process.cwd(),
                verbose: !currentOptions.quiet
            });
        } else if (currentOptions.printConfig) {
            const descriptor = await loadDescriptor(currentOptions);
            Logger.log(JSON.stringify(descriptor, null, 4));
            return Promise.resolve(0);
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
    async executeWithOptions(executeOptions: ExecuteOptions): Promise<number> {
        const cliOptions = executeOptions.cliOptions;
        // cli > textlintrc
        // if cli and textlintrc have same option, cli option is prior.
        const descriptor = await loadDescriptor(cliOptions);
        const hasRuleAtLeastOne = descriptor.rule.lintableDescriptors.length > 0;
        if (!hasRuleAtLeastOne) {
            showEmptyRuleWarning();
            return Promise.resolve(1);
        }
        const linter = createLinter({
            cache: cliOptions.cache,
            cacheLocation: cliOptions.cacheLocation,
            quiet: cliOptions.quiet,
            ignoreFilePath: cliOptions.ignorePath,
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
                return printResults(output, cliOptions) ? Promise.resolve(0) : Promise.resolve(2);
            }
            // modify file and return exit status
            await fixer.write(results);
            if (printResults(output, cliOptions)) {
                if (cliOptions.outputFile) {
                    return 0; // if --output-file option is specified, exit status is always 0
                }
                // --fix result has remaining errors, return 1
                const hasErrorMessage = results.some((result) => {
                    return result.remainingMessages.some((message) => message.severity === SeverityLevel.error);
                });
                return hasErrorMessage ? 1 : 0;
            } else {
                return 2;
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
            if (printResults(output, cliOptions)) {
                if (cliOptions.outputFile) {
                    return 0; // if --output-file option is specified, exit status is always 0
                }
                const hasErrorMessage = results.some((result) => {
                    return result.messages.some((message) => message.severity === SeverityLevel.error);
                });
                return hasErrorMessage ? 1 : 0;
            } else {
                return 2;
            }
        }
    }
};
