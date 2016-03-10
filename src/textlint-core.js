// LICENSE : MIT
"use strict";
/*
    textlint-core.js is a class
    textlint.js is a singleton object that is instance of textlint-core.js.
 */
const path = require("path");
const fs = require("fs");
const assert = require("assert");
const SourceCode = require("./rule/source-code");
import {getProcessorMatchExtension} from "./util/proccesor-helper";
import {Processor as MarkdownProcessor} from "textlint-plugin-markdown";
import {Processor as TextProcessor} from "textlint-plugin-text";
import RuleCreatorSet from "./rule/rule-creator-set";

// Linter
import FixerProcessor from "./fixer/fixer-processor";
import LinterProcessor from "./linter/linter-processor";

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
        const linterProcessor = new LinterProcessor(processor);
        return linterProcessor.process({
            config: this.config,
            ruleCreatorSet: this.ruleCreatorSet,
            sourceCode: sourceCode
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
        const fixerProcessor = new FixerProcessor(processor);
        return fixerProcessor.process({
            config: this.config,
            ruleCreatorSet: this.ruleCreatorSet,
            sourceCode: sourceCode
        });
    }
}
