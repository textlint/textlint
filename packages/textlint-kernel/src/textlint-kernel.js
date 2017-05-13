// MIT © 2017 azu
"use strict";
const assert = require("assert");
import SourceCode from "./core/source-code";
import PluginCreatorSet from "./core/plugin-creator-set";
import RuleCreatorSet from "./core/rule-creator-set";
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
 * @returns {Function|undefined} PluginConstructor
 */
function findPluginWithExt(plugins = [], ext) {
    const matchProcessors = plugins.filter(pluginConstructor => {
        // static availableExtensions() method
        assert.ok(typeof pluginConstructor.availableExtensions === "function",
            `Processor(${pluginConstructor.name} should have availableExtensions()`);
        const extList = pluginConstructor.availableExtensions();
        return extList.some(targetExt => targetExt === ext || ("." + targetExt) === ext);
    });
    if (matchProcessors.length === 0) {
        return;
    }
    return matchProcessors[0];
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
    constructor(config = {}) {
        // this.config often is undefined.
        this.config = config;
        this.pluginCreatorSet = new PluginCreatorSet();
        this.ruleCreatorSet = new RuleCreatorSet();
        this.filterRuleCreatorSet = new RuleCreatorSet();
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
     * Register Processors plugins
     */
    setupPlugins(pluginConstructors = []) {
        this.plugins = pluginConstructors.map(PluginConstructor => {
            return new PluginConstructor(this.config);
        });
    }

    /**
     * Register rules and rulesConfig.
     * if want to release rules, please call {@link resetRules}.
     * @param {TextlintKernelRule[]} [rules] rule objects array
     */
    setupRules(rules = []) {
        this.rules = rules;
    }

    /**
     * @param {TextlintKernelFilterRule[]} [filterRules] rule objects array
     */
    setupFilterRules(filterRules = []) {
        this.filterRules = filterRules;
    }

    /**
     * Remove all registered rule and clear messages.
     */
    reset() {
        // FIXME: remove
    }


    /**
     * lint text by registered rules.
     * The result contains target filePath and error messages.
     * @param {string} text
     * @param {TextlintKernelOptions} options linting options
     * @returns {Promise.<TextLintResult>}
     */
    lintText(text, options) {
        const Processor = findPluginWithExt(options.plugins, options.ext);
        const processor = new Processor(this.config);
        return this._parallelProcess({
            processor, text, options
        });
    }

    /**
     * fix texts and return fix result object
     * @param {string} text
     * @param {TextlintKernelOptions} options lint options
     * @returns {Promise.<TextLintFixResult>}
     */
    fixText(text, options) {
        const Processor = findPluginWithExt(options.plugins, options.ext);
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
     * @param {TextlintKernelOptions} options
     * @returns {Promise.<TextLintResult>}
     * @private
     */
    _parallelProcess({
                         processor,
                         text,
                         options
                     }) {
        const { ext, filePath, rules, filterRules } = options;
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
        const linterProcessor = new LinterProcessor(processor, this.messageProcessManager);
        return linterProcessor.process({
            config: this.config,
            rules,
            filterRules,
            sourceCode
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
        const { ext, filePath, rules, filterRules } = options;
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
        const fixerProcessor = new FixerProcessor(processor, this.messageProcessManager);
        return fixerProcessor.process({
            config: this.config,
            rules,
            filterRules,
            sourceCode
        }).catch(error => {
            error.message = addingAtFileNameToError(filePath, error.message);
            return Promise.reject(error);
        });
    }
}
