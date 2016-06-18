// LICENSE : MIT
"use strict";
/*
 textlint-core.js is a class
 textlint.js is a singleton object that is instance of textlint-core.js.
 */
const path = require("path");
const assert = require("assert");
import {readFile} from "./util/fs-promise";
import SourceCode from "./core/source-code";
import {getProcessorMatchExtension} from "./util/proccesor-helper";
import {Processor as MarkdownProcessor} from "textlint-plugin-markdown";
import {Processor as TextProcessor} from "textlint-plugin-text";
import RuleCreatorSet from "./core/rule-creator-set";
// = Processors
// sequence
import FixerProcessor from "./fixer/fixer-processor";
// parallel
import LinterProcessor from "./linter/linter-processor";
// messsage process manager
import MessageProcessManager from "./messages/MessageProcessManager";
import filterIgnoredProcess from "./messages/filter-ignored-process";
import filterDuplicatedProcess from "./messages/filter-duplicated-process";
import sortMessageProcess from "./messages/sort-messages-process";
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
 * @class {TextlintCore}
 */
export default class TextlintCore {
    constructor(config = {}) {
        // this.config often is undefined.
        this.config = config;
        this.ruleCreatorSet = new RuleCreatorSet();
        this.filterRuleCreatorSet = new RuleCreatorSet();
        // Markdown and Text are for backward compatibility.
        // FIXME: in the future, this.processors is empty by default.
        this._defaultProcessors = [
            new MarkdownProcessor(config),
            new TextProcessor(config)
        ];
        this.processors = this._defaultProcessors.slice();
        // Initialize Message Processor
        // Now, It it built-in process only
        this.messageProcessManager = new MessageProcessManager();
        // filter `shouldIgnore()` results
        this.messageProcessManager.add(filterIgnoredProcess);
        // filter duplicated messages
        this.messageProcessManager.add(filterDuplicatedProcess);
        this.messageProcessManager.add(sortMessageProcess);
    }

    /**
     * unstable API
     * @param Processor
     * @private
     */
    addProcessor(Processor) {
        // add first
        this.processors.unshift(new Processor(this.config));
    }

    /**
     * register Processors
     * @param {Object} processors
     */
    setupProcessors(processors = {}) {
        this.processors.length = 0;
        Object.keys(processors).forEach(key => {
            const Processor = processors[key];
            this.addProcessor(Processor);
        });
        this.processors = this.processors.concat(this._defaultProcessors);
    }


    /**
     * Register rules and rulesConfig.
     * if want to release rules, please call {@link resetRules}.
     * @param {object} rules rule objects array
     * @param {object} [rulesConfig] ruleConfig is object
     */
    setupRules(rules = {}, rulesConfig = {}) {
        this.ruleCreatorSet = new RuleCreatorSet(rules, rulesConfig);
    }

    /**
     * Register filterRules and filterRulesConfig.
     * if want to release rules, please call {@link resetRules}.
     * @param {object} rules rule objects array
     * @param {object} [rulesConfig] ruleConfig is object
     */
    setupFilterRules(rules = {}, rulesConfig = {}) {
        this.filterRuleCreatorSet = new RuleCreatorSet(rules, rulesConfig);
    }

    /**
     * Remove all registered rule and clear messages.
     */
    resetRules() {
        this.ruleCreatorSet = new RuleCreatorSet();
        this.filterRuleCreatorSet = new RuleCreatorSet();
    }

    /**
     * process text in parallel for Rules and return {Promise.<TextLintResult>}
     * In other word, parallel flow process.
     * @param processor
     * @param text
     * @param ext
     * @param filePath
     * @returns {Promise.<TextLintResult>}
     * @private
     */
    _parallelProcess(processor, text, ext, filePath) {
        assert(processor, `processor is not found for ${ext}`);
        const {preProcess, postProcess} = processor.processor(ext);
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
            ruleCreatorSet: this.ruleCreatorSet,
            filterRuleCreatorSet: this.filterRuleCreatorSet,
            sourceCode: sourceCode
        }).catch(error => {
            error.message = addingAtFileNameToError(filePath, error.message);
            return Promise.reject(error);
        });
    }

    /**
     * lint text by registered rules.
     * The result contains target filePath and error messages.
     * @param {string} text
     * @param {string} ext ext is extension. default: .txt
     * @returns {Promise.<TextLintResult>}
     */
    lintText(text, ext = ".txt") {
        const processor = getProcessorMatchExtension(this.processors, ext);
        return this._parallelProcess(processor, text, ext);
    }

    /**
     * lint markdown text by registered rules.
     * The result contains target filePath and error messages.
     * @param {string} text markdown format text
     * @returns {Promise.<TextLintResult>}
     */
    lintMarkdown(text) {
        const ext = ".md";
        return this.lintText(text, ext);
    }

    /**
     * lint file and return result object
     * @param {string} filePath
     * @returns {Promise.<TextLintResult>} result
     */
    lintFile(filePath) {
        const absoluteFilePath = path.resolve(process.cwd(), filePath);
        const ext = path.extname(absoluteFilePath);
        return readFile(absoluteFilePath).then(text => {
            const processor = getProcessorMatchExtension(this.processors, ext);
            return this._parallelProcess(processor, text, ext, absoluteFilePath);
        });
    }

    /**
     * fix file and return fix result object
     * @param {string} filePath
     * @returns {Promise.<TextLintFixResult>}
     */
    fixFile(filePath) {
        const absoluteFilePath = path.resolve(process.cwd(), filePath);
        const ext = path.extname(absoluteFilePath);
        return readFile(absoluteFilePath).then(text => {
            const processor = getProcessorMatchExtension(this.processors, ext);
            return this._sequenceProcess(processor, text, ext, absoluteFilePath);
        });
    }

    /**
     * fix texts and return fix result object
     * @param {string} text
     * @param {string} ext
     * @returns {Promise.<TextLintFixResult>}
     */
    fixText(text, ext = ".txt") {
        const processor = getProcessorMatchExtension(this.processors, ext);
        return this._sequenceProcess(processor, text, ext);
    }

    /**
     * process text in series for Rules and return {Promise.<TextLintFixResult>}
     * In other word, sequence flow process.
     * @param processor
     * @param text
     * @param ext
     * @param filePath
     * @returns {Promise.<TextLintFixResult>}
     * @private
     */
    _sequenceProcess(processor, text, ext, filePath) {
        assert(processor, `processor is not found for ${ext}`);
        const {preProcess, postProcess} = processor.processor(ext);
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
            ruleCreatorSet: this.ruleCreatorSet,
            filterRuleCreatorSet: this.filterRuleCreatorSet,
            sourceCode: sourceCode
        }).catch(error => {
            error.message = addingAtFileNameToError(filePath, error.message);
            return Promise.reject(error);
        });
    }
}
