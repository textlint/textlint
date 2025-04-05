// MIT © 2017- azu
// sequence
import FixerProcessor from "./fixer/fixer-processor";
// parallel
import LinterProcessor from "./linter/linter-processor";
// message process manager
import MessageProcessManager from "./messages/MessageProcessManager";
import filterIgnoredProcess from "./messages/filter-ignored-process";
import filterDuplicatedProcess from "./messages/filter-duplicated-process";
import filterSeverityProcess from "./messages/filter-severity-process";
import sortMessageProcess from "./messages/sort-messages-process";
import { TextlintKernelConstructorOptions, TextlintKernelOptions } from "./textlint-kernel-interface";
import type { TextlintFixResult, TextlintResult } from "@textlint/types";
import { TextlintKernelDescriptor } from "./descriptor";
import { TextlintSourceCodeImpl } from "./context/TextlintSourceCodeImpl";
import { isPluginParsedObject } from "./util/isPluginParsedObject";
import { invariant } from "./util/invariant";
import { coreFlags } from "@textlint/feature-flag";
import { isTxtAST } from "@textlint/ast-tester";
import _debug from "debug";
import { parseByPlugin } from "./util/parse-by-plugin";
import { createDummyTextLintResult } from "./util/createDummyTextLintResult";

const debug = _debug("textlint:kernel");

/**
 * add fileName to trailing of error message
 * @param {string|undefined} fileName
 * @param {string} message
 * @returns {string}
 */
function addingAtFileNameToError(fileName: string | undefined, message: string) {
    if (!fileName) {
        return message;
    }
    return `${message}
at ${fileName}`;
}

/**
 * TextlintKernel is core logic written by pure JavaScript.
 *
 * Pass
 *
 * - config
 * - plugins
 * - rules
 * - filterRules
 * - messageProcessor
 *
 */
export class TextlintKernel {
    private readonly config: TextlintKernelConstructorOptions;
    private readonly messageProcessManager: MessageProcessManager;

    /**
     * @param config
     */
    constructor(config: TextlintKernelConstructorOptions = {}) {
        // this.config often is undefined.
        this.config = config;
        // Initialize Message Processor
        // Now, It is built-in process only
        // filter `shouldIgnore()` results
        this.messageProcessManager = new MessageProcessManager([filterIgnoredProcess]);
        // filter duplicated messages
        this.messageProcessManager.add(filterDuplicatedProcess);
        // filter by severity
        this.messageProcessManager.add(filterSeverityProcess(this.config));
        this.messageProcessManager.add(sortMessageProcess);
    }

    /**
     * lint text by registered rules.
     * The result contains target filePath and error messages.
     * @param {string} text
     * @param {Object} options linting options
     * @returns {Promise.<TextlintResult>}
     */
    lintText(text: string, options: TextlintKernelOptions): Promise<TextlintResult> {
        return Promise.resolve().then(() => {
            const descriptor = new TextlintKernelDescriptor({
                rules: options.rules || [],
                filterRules: options.filterRules || [],
                plugins: options.plugins || []
            });
            return this._parallelProcess({
                descriptor,
                text,
                options
            });
        });
    }

    /**
     * fix texts and return fix result object
     * @param {string} text
     * @param {Object} options lint options
     * @returns {Promise.<TextlintFixResult>}
     */
    fixText(text: string, options: TextlintKernelOptions): Promise<TextlintFixResult> {
        return Promise.resolve().then(() => {
            const descriptor = new TextlintKernelDescriptor({
                rules: options.rules || [],
                filterRules: options.filterRules || [],
                plugins: options.plugins || []
            });
            return this._sequenceProcess({
                descriptor,
                options,
                text
            });
        });
    }

    /**
     * process text in parallel for Rules and return {Promise.<TextLintResult>}
     * In other word, parallel flow process.
     * @param {*} processor
     * @param {string} text
     * @param {Object} options
     * @returns {Promise.<TextlintResult>}
     * @private
     */
    private async _parallelProcess({
        descriptor,
        text,
        options
    }: {
        descriptor: TextlintKernelDescriptor;
        text: string;
        options: TextlintKernelOptions;
    }): Promise<TextlintResult> {
        const { ext, filePath, configBaseDir } = options;
        const plugin = descriptor.findPluginDescriptorWithExt(ext);
        if (plugin === undefined) {
            throw new Error(`Not found available plugin for ${ext}`);
        }
        debug("used plugin %j", plugin.id);
        const processor = plugin.processor;
        const { preProcess, postProcess } = processor.processor(ext);
        invariant(
            typeof preProcess === "function" && typeof postProcess === "function",
            `${plugin.id} processor should implements {preProcess, postProcess}`
        );
        const preProcessResult = await parseByPlugin({
            preProcess,
            sourceText: text,
            filePath
        });
        if (preProcessResult instanceof Error) {
            return createDummyTextLintResult(
                `Failed to parse text by plugin: ${plugin.id}

Please report this error with the content to plugin author.

${preProcessResult.stack}            
`,
                filePath
            );
        }
        // { text, ast } or ast
        const isParsedObject = isPluginParsedObject(preProcessResult);
        const textForAST = isParsedObject ? preProcessResult.text : text;
        const ast = isParsedObject ? preProcessResult.ast : preProcessResult;
        invariant(typeof textForAST === "string", `${plugin.id} processor should return correct text`);
        invariant(typeof ast === "object", `${plugin.id} processor should return correct AST object`);
        if (coreFlags.runningTester) {
            invariant(
                isTxtAST(ast),
                `${plugin.id} processor return invalid AST object. Please check out @textlint/ast-tester.
            
You can check the validation result with "DEBUG=textlint*" env

See https://textlint.org/docs/plugin.html`
            );
        }
        const sourceCode = new TextlintSourceCodeImpl({
            text: textForAST,
            ast,
            ext,
            filePath
        });
        debug("process file %s", filePath);
        const linterProcessor = new LinterProcessor(processor, this.messageProcessManager);
        return await linterProcessor
            .process({
                config: this.config,
                ruleDescriptors: descriptor.rule,
                filterRuleDescriptors: descriptor.filterRule,
                sourceCode,
                configBaseDir
            })
            .catch((error) => {
                error.message = addingAtFileNameToError(filePath, error.message);
                return Promise.reject(error);
            });
    }

    /**
     * process text in series for Rules and return {Promise.<TextlintFixResult>}
     * In other word, sequence flow process.
     * @param {*} processor
     * @param {string} text
     * @param {TextlintKernelOptions} options
     * @returns {Promise.<TextlintFixResult>}
     * @private
     */
    private async _sequenceProcess({
        descriptor,
        text,
        options
    }: {
        descriptor: TextlintKernelDescriptor;
        text: string;
        options: TextlintKernelOptions;
    }): Promise<TextlintFixResult> {
        const { ext, filePath, configBaseDir } = options;
        const plugin = descriptor.findPluginDescriptorWithExt(ext);
        if (plugin === undefined) {
            throw new Error(`Not found available plugin for ${ext}`);
        }
        debug("used plugin %j", plugin.id);
        const processor = plugin.processor;
        const { preProcess, postProcess } = processor.processor(ext);
        invariant(
            typeof preProcess === "function" && typeof postProcess === "function",
            `${plugin.id} processor should implements {preProcess, postProcess}`
        );
        const preProcessResult = await Promise.resolve(preProcess(text, filePath));
        // { text, ast } or ast
        const isParsedObject = isPluginParsedObject(preProcessResult);
        const textForAST = isParsedObject ? preProcessResult.text : text;
        const ast = isParsedObject ? preProcessResult.ast : preProcessResult;
        invariant(typeof textForAST === "string", `${plugin.id} processor should return correct text`);
        invariant(typeof ast === "object", `${plugin.id} processor should return correct AST object`);
        if (coreFlags.runningTester) {
            invariant(
                isTxtAST(ast),
                `${plugin.id} processor return invalid AST object. Please check out @textlint/ast-tester.
            
You can check the validation result with "DEBUG=textlint*" env

See https://textlint.org/docs/plugin.html`
            );
        }
        const sourceCode = new TextlintSourceCodeImpl({
            text: textForAST,
            ast,
            ext,
            filePath
        });
        debug("process file %s", filePath);
        const fixerProcessor = new FixerProcessor(processor, this.messageProcessManager);
        return await fixerProcessor
            .process({
                config: this.config,
                ruleDescriptors: descriptor.rule,
                filterRules: descriptor.filterRule,
                sourceCode,
                configBaseDir
            })
            .catch((error) => {
                error.message = addingAtFileNameToError(filePath, error.message);
                return Promise.reject(error);
            });
    }
}
