// MIT © 2017 azu
"use strict";
const assert = require("assert");
const Ajv = require("ajv");
const ajv = new Ajv();
const TextlintKernelOptionsSchema = require("./TextlintKernelOptions.json");
var path = require("path");
import SourceCode from "./core/source-code";
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

/**
 * @param {TextlintKernelPlugin[]} plugins
 * @param {string} ext
 * @returns {TextlintKernelPlugin|undefined} PluginConstructor
 */
function findPluginWithExt(plugins = [], ext) {
    const matchPlugins = plugins.filter((kernelPlugin) => {
        const plugin = kernelPlugin.plugin;
        // static availableExtensions() method
        assert.ok(typeof plugin.Processor.availableExtensions === "function",
            `Processor(${plugin.Processor.name} should have availableExtensions()`);
        const extList = plugin.Processor.availableExtensions();
        return extList.some(targetExt => targetExt === ext || ("." + targetExt) === ext);
    });
    if (matchPlugins.length === 0) {
        return;
    }
    return matchPlugins[0];
}
/**
 * add fileName to trailing of error message
 * @param {string|undefined} fileName
 * @param {string} message
 * @returns {string}
 */
function addingAtFileNameToError(fileName, message) {
    if (!fileName) {
        return message;
    }
    return `${message}
at ${fileName}`;

}

/**
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
    /**
     * TODO: THIS
     * @param config
     */
    constructor(config = {}) {
        // this.config often is undefined.
        this.config = config;
        // Initialize Message Processor
        // Now, It it built-in process only
        this.messageProcessManager = new MessageProcessManager();
        // filter `shouldIgnore()` results
        this.messageProcessManager.add(filterIgnoredProcess);
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
     * @returns {Promise.<TextLintResult>}
     */
    lintText(text, options) {
        const valid = ajv.validate(TextlintKernelOptionsSchema, options);
        if (!valid) {
            return Promise.reject(new Error(`options is invalid. Please check document.
Errors: ${JSON.stringify(ajv.errors, null, 4)}
Actual: ${JSON.stringify(options, null, 4)}
`));
        }
        const ext = options.ext;
        const plugin = findPluginWithExt(options.plugins, ext);
        assert(plugin !== undefined && plugin.plugin !== undefined, `Not found available plugin for ${ ext }`);
        const Processor = plugin.plugin.Processor;
        assert(Processor !== undefined, `This plugin has not Processor: ${plugin}`);
        const processor = new Processor(this.config);
        return this._parallelProcess({
            processor, text, options
        });
    }

    /**
     * fix texts and return fix result object
     * @param {string} text
     * @param {Object} options lint options
     * @returns {Promise.<TextLintFixResult>}
     */
    fixText(text, options) {
        const valid = ajv.validate(TextlintKernelOptionsSchema, options);
        if (!valid) {
            return Promise.reject(new Error(`options is invalid. Please check document.
Errors: ${JSON.stringify(ajv.errors, null, 4)}
Actual: ${JSON.stringify(options, null, 4)}
`));
        }
        const ext = options.ext;
        const plugin = findPluginWithExt(options.plugins, ext);
        assert(plugin !== undefined, `Not found available plugin for ${ ext }`);
        const Processor = plugin.plugin.Processor;
        assert(Processor !== undefined, `This plugin has not Processor: ${plugin}`);
        const processor = new Processor(this.config);
        return this._sequenceProcess({
            processor,
            text,
            options
        });
    }


    /**
     * process text in parallel for Rules and return {Promise.<TextLintResult>}
     * In other word, parallel flow process.
     * @param {*} processor
     * @param {string} text
     * @param {Object} options
     * @returns {Promise.<TextLintResult>}
     * @private
     */
    _parallelProcess({
                         processor,
                         text,
                         options
                     }) {
        const { ext, filePath, rules, filterRules, configBaseDir } = options;
        const { preProcess, postProcess } = processor.processor(ext);
        assert(typeof preProcess === "function" && typeof postProcess === "function",
            "processor should implement {preProcess, postProcess}");
        const ast = preProcess(text, filePath);
        const sourceCode = new SourceCode({
            text,
            ast,
            ext,
            filePath
        });
        const configFileBaseDir = this.config.configFile ? path.dirname(this.config.configFile) : null;
        const absoluteConfigBaseDir = configBaseDir || configFileBaseDir;
        const linterProcessor = new LinterProcessor(processor, this.messageProcessManager);
        return linterProcessor.process({
            config: this.config,
            rules,
            filterRules,
            sourceCode,
            configBaseDir: absoluteConfigBaseDir
        }).catch(error => {
            error.message = addingAtFileNameToError(filePath, error.message);
            return Promise.reject(error);
        });
    }

    /**
     * process text in series for Rules and return {Promise.<TextLintFixResult>}
     * In other word, sequence flow process.
     * @param {*} processor
     * @param {string} text
     * @param {TextlintKernelOptions} options
     * @returns {Promise.<TextLintFixResult>}
     * @private
     */
    _sequenceProcess({ processor, text, options }) {
        const { ext, filePath, rules, filterRules, configBaseDir } = options;
        assert(processor, `processor is not found for ${ext}`);
        const { preProcess, postProcess } = processor.processor(ext);
        assert(typeof preProcess === "function" && typeof postProcess === "function",
            "processor should implement {preProcess, postProcess}");
        const ast = preProcess(text, filePath);
        const sourceCode = new SourceCode({
            text,
            ast,
            ext,
            filePath
        });
        const configFileBaseDir = this.config.configFile ? path.dirname(this.config.configFile) : null;
        const absoluteConfigBaseDir = configBaseDir || configFileBaseDir;
        const fixerProcessor = new FixerProcessor(processor, this.messageProcessManager);
        return fixerProcessor.process({
            config: this.config,
            rules,
            filterRules,
            sourceCode,
            configBaseDir: absoluteConfigBaseDir
        }).catch(error => {
            error.message = addingAtFileNameToError(filePath, error.message);
            return Promise.reject(error);
        });
    }
}
