// LICENSE : MIT
'use strict';
/*
    textlint-core.js is a class
    textlint.js is a singleton object that is instance of textlint-core.js.
 */
const Promise = require("bluebird");
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const SourceCode = require("./rule/source-code");
const debug = require('debug')('textlint:core');
import CoreTask from "./textlint-core-task";
import {getProcessorMatchExtension} from "./util/proccesor-helper";
import {Processor as MarkdownProcessor} from "textlint-plugin-markdown";
import {Processor as TextProcessor} from "textlint-plugin-text";

export default class TextlintCore {
    constructor(config = {}) {
        // this.config often is undefined.
        this.config = config;
        this.rules = {};
        this.rulesConfig = {};
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
        const ignoreDisableRules = (rules) => {
            let resultRules = Object.create(null);
            Object.keys(rules).forEach(key => {
                const ruleCreator = rules[key];
                //if (typeof ruleCreator !== 'function') {
                //    throw new Error(`Definition of rule '${ key }' was not found.`);
                //}
                // "rule-name" : false => disable
                const ruleConfig = rulesConfig && rulesConfig[key];
                if (ruleConfig !== false) {
                    debug('use "%s" rule', key);
                    resultRules[key] = rules[key];
                }

            });
            return resultRules;
        };
        this.rules = ignoreDisableRules(rules);
        this.rulesConfig = rulesConfig;
    }

    /**
     * Remove all registered rule and clear messages.
     */
    resetRules() {
        // noop
    }

    _lintByProcessor(processor, text, ext, filePath) {
        assert(processor, `processor is not found for ${ext}`);
        const {preProcess, postProcess} = processor.processor(ext);
        assert(typeof preProcess === "function" && typeof postProcess === "function",
            `processor should implement {preProcess, postProcess}`);
        const ast = preProcess(text, filePath);
        const sourceCode = new SourceCode(text, filePath);
        const task = new CoreTask({
            config: this.config,
            rules: this.rules,
            rulesConfig: this.rulesConfig,
            sourceCode: sourceCode
        });
        return new Promise((resolve, reject) => {
            const messages = [];
            task.on(CoreTask.events.message, message => {
                messages.push(message);
            });
            task.on(CoreTask.events.complete, () => {
                const result = postProcess(messages, filePath);
                if (result.filePath == null) {
                    result.filePath = `<Unkown${ext}>`;
                }
                assert(result.filePath && result.messages.length >= 0, "postProcess should return { messages, filePath } ");
                resolve(result);
            });
            task.process(ast);
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
        const text = fs.readFileSync(absoluteFilePath, 'utf-8');
        const processor = getProcessorMatchExtension(this.processors, ext);
        return this._lintByProcessor(processor, text, ext, absoluteFilePath);
    }

    fixFile(filePath) {
        const absoluteFilePath = path.resolve(process.cwd(), filePath);
        const ext = path.extname(absoluteFilePath);
        const text = fs.readFileSync(absoluteFilePath, 'utf-8');
        const processor = getProcessorMatchExtension(this.processors, ext);
        return this._fixProcess(processor, text, ext, filePath);
    }

    fixText(text, ext = ".txt") {
        const processor = getProcessorMatchExtension(this.processors, ext);
        return this._fixProcess(processor, text, ext);
    }

    _fixProcess(processor, text, ext, filePath) {
        const fixerRules = Object.keys(this.rules).map(ruleName => {
            return this.rules[ruleName];
        }).filter(rule => {
            return typeof rule["fixer"] !== "undefined";
        });
        const fixerProcessList = fixerRules.map(rule => {
            return (textForProcessing) => {
                const {preProcess, postProcess} = processor.processor(ext);
                const ast = preProcess(textForProcessing, filePath);
                const sourceCode = new SourceCode(text, filePath);
                const task = new CoreTask({
                    config: this.config,
                    rules: [rule],
                    rulesConfig: this.rulesConfig,
                    sourceCode: sourceCode
                });
                return new Promise((resolve, reject) => {
                    const messages = [];
                    task.on(CoreTask.events.message, message => {
                        messages.push(message);
                    });
                    task.on(CoreTask.events.complete, () => {
                        const result = postProcess(messages, filePath);
                        if (result.filePath == null) {
                            result.filePath = `<Unkown${ext}>`;
                        }
                        assert(result.filePath && result.messages.length >= 0, "postProcess should return { messages, filePath } ");
                        const SourceCodeFixer = require("./fixer/source-code-fixer");
                        const applied = SourceCodeFixer.applyFixes(textForProcessing, messages);
                        if (applied.fixed) {
                            console.log("FIXED: " + applied.output);
                            resolve(applied.output);
                            return;
                        }
                        resolve(textForProcessing);
                    });
                    task.process(ast);
                });
            };
        });

        return fixerProcessList.reduce((promise, fixerProcess) => {
            return promise.then((text) => {
                return fixerProcess(text);
            });
        }, Promise.resolve(text));
    };
}
