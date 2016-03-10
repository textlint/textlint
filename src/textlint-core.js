// LICENSE : MIT
"use strict";
/*
    textlint-core.js is a class
    textlint.js is a singleton object that is instance of textlint-core.js.
 */
const Promise = require("bluebird");
const path = require("path");
const fs = require("fs");
const assert = require("assert");
const SourceCode = require("./rule/source-code");
const SourceCodeFixer = require("./fixer/source-code-fixer");
const debug = require("debug")("textlint:core");
import FixerTask from "./task/fixer-task";
import LinterTask from "./task/linter-task";
import TaskRunner from "./task/task-runner";
import {getProcessorMatchExtension} from "./util/proccesor-helper";
import {Processor as MarkdownProcessor} from "textlint-plugin-markdown";
import {Processor as TextProcessor} from "textlint-plugin-text";
import RuleCreatorSet from "./rule/rule-creator-set";
export default class TextlintCore {
    constructor(config = {}) {
        // this.config often is undefined.
        this.config = config;
        this.ruleCreatorSet = new RuleCreatorSet();
        // FIXME: in the future, this.processors is empty by default.
        // Markdown and Text are for backward compatibility.
        this.processors = [
            new MarkdownProcessor(config),
            new TextProcessor(config)
        ];
    }

    // unstable API
    addProcessor(Processor) {
        // add first
        this.processors.unshift(new Processor(this.config));
    }

    /**
     * Register rules to EventEmitter.
     * if want to release rules, please call {@link this.resetRules}.
     * @param {object} rules rule objects array
     * @param {object} [rulesConfig] ruleConfig is object
     */
    setupRules(rules = {}, rulesConfig = {}) {
        this.ruleCreatorSet = new RuleCreatorSet(rules, rulesConfig);
    }

    /**
     * Remove all registered rule and clear messages.
     */
    resetRules() {
        this.ruleCreatorSet = new RuleCreatorSet();
    }

    _lintByProcessor(processor, text, ext, filePath) {
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
        const task = new LinterTask({
            config: this.config,
            ruleCreatorSet: this.ruleCreatorSet,
            sourceCode: sourceCode
        });
        const taskRunner = new TaskRunner(task);
        return taskRunner.process().then(messages => {
            const result = postProcess(messages, filePath);
            if (result.filePath == null) {
                result.filePath = `<Unkown${ext}>`;
            }
            assert(result.filePath && result.messages.length >= 0, "postProcess should return { messages, filePath } ");
            return result;
        });
    }

    /**
     * lint text by registered rules.
     * The result contains target filePath and error messages.
     * @param {string} text
     * @param {string} ext ext is extension. default: .txt
     * @returns {TextLintResult}
     */
    lintText(text, ext = ".txt") {
        const processor = getProcessorMatchExtension(this.processors, ext);
        return this._lintByProcessor(processor, text, ext);
    }

    /**
     * lint markdown text by registered rules.
     * The result contains target filePath and error messages.
     * @param {string} text markdown format text
     * @returns {TextLintResult}
     */
    lintMarkdown(text) {
        const ext = ".md";
        const processor = getProcessorMatchExtension(this.processors, ext);
        return this._lintByProcessor(processor, text, ext);
    }

    /**
     * lint file and return result object
     * @param {string} filePath
     * @returns {TextLintResult} result
     */
    lintFile(filePath) {
        const absoluteFilePath = path.resolve(process.cwd(), filePath);
        const ext = path.extname(absoluteFilePath);
        const text = fs.readFileSync(absoluteFilePath, "utf-8");
        const processor = getProcessorMatchExtension(this.processors, ext);
        return this._lintByProcessor(processor, text, ext, absoluteFilePath);
    }

    /**
     * fix file and return fix result object
     * @param {string} filePath
     * @returns {TextLintFixResult}
     */
    fixFile(filePath) {
        const absoluteFilePath = path.resolve(process.cwd(), filePath);
        const ext = path.extname(absoluteFilePath);
        const text = fs.readFileSync(absoluteFilePath, "utf-8");
        const processor = getProcessorMatchExtension(this.processors, ext);
        return this._fixProcess(processor, text, ext, filePath);
    }

    /**
     * fix texts and return fix result object
     * @param {string} text
     * @param {string} ext
     * @returns {TextLintFixResult}
     */
    fixText(text, ext = ".txt") {
        const processor = getProcessorMatchExtension(this.processors, ext);
        return this._fixProcess(processor, text, ext);
    }

    _fixProcess(processor, text, ext, filePath) {
        const {preProcess, postProcess} = processor.processor(ext);

        // messages
        let resultFilePath = filePath;
        const applyingMessages = [];
        const remainingMessages = [];
        const originalMessages = [];
        const fixerProcessList = this.ruleCreatorSet.mapFixer(fixerRuleCreatorSet => {
            return (sourceText) => {
                // create new SourceCode object
                const newSourceCode = new SourceCode({
                    text: sourceText,
                    ast: preProcess(sourceText),
                    filePath,
                    ext
                });
                // create new Task
                const task = new FixerTask({
                    config: this.config,
                    ruleCreatorSet: fixerRuleCreatorSet,
                    sourceCode: newSourceCode
                });

                const taskRunner = new TaskRunner(task);
                return taskRunner.process().then(messages => {
                    const result = postProcess(messages, filePath);
                    resultFilePath = result.filePath;
                    const applied = SourceCodeFixer.applyFixes(newSourceCode, result.messages);
                    // add messages
                    Array.prototype.push.apply(applyingMessages, applied.applyingMessages);
                    Array.prototype.push.apply(remainingMessages, applied.remainingMessages);
                    Array.prototype.push.apply(originalMessages, applied.messages);
                    // if not fixed, still use current sourceText
                    if (!applied.fixed) {
                        return sourceText;
                    }
                    // if fixed, use fixed text at next
                    return applied.output;
                });
            };
        });

        const promiseTask = fixerProcessList.reduce((promise, fixerProcess) => {
            return promise.then((sourceText) => {
                return fixerProcess(sourceText);
            });
        }, Promise.resolve(text));

        return promiseTask.then(output => {
            debug(`Finish Processing: ${resultFilePath}`);
            debug(`applyingMessages: ${applyingMessages.length}`);
            debug(`remainingMessages: ${remainingMessages.length}`);
            return {
                filePath: resultFilePath,
                output,
                originalMessages,
                applyingMessages,
                remainingMessages
            };
        });
    }
}
