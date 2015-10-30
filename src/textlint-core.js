// LICENSE : MIT
'use strict';
/*
    textlint-core.js is a class
    textlint.js is a singleton object that is instance of textlint-core.js.
 */
const objectAssign = require('object-assign');
const TraverseController = require('txt-ast-traverse').Controller;
const traverseController = new TraverseController();
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const RuleContext = require('./rule/rule-context');
const RuleContextAgent = require("./RuleContextAgent");
const debug = require('debug')('textlint:core');
import {getProcessorMatchExtension} from "./util/proccesor-helper";
import {Processor as MarkdownProcessor} from "textlint-plugin-markdown";
import {Processor as TextProcessor} from "textlint-plugin-text";
import {Processor as HTMLProcessor} from "textlint-plugin-html";
// add all the node types as listeners
function addListenRule(rule, target) {
    Object.keys(rule).forEach(nodeType => {
        target.on(nodeType, rule[nodeType]);
    });
}

export default class TextlintCore {
    constructor(config = {}) {
        // this.config often is undefined.
        this.config = config;
        // FIXME: in the future, this.processors is empty by default.
        // Markdown and Text are for backward compatibility.
        this.processors = [
            new MarkdownProcessor(config),
            new TextProcessor(config),
            new HTMLProcessor(config)
        ];
        this.ruleContextAgent = new RuleContextAgent();
    }

    // unstable API
    addProcessor(Processtor) {
        // add first
        this.processors.unshift(new Processtor(this.config));
    }

    /**
     * Register rules to EventEmitter.
     * if want to release rules, please call {@link this.resetRules}.
     * @param {object} rules rule objects array
     * @param {object} [rulesConfig] ruleConfig is object
     */
    setupRules(rules, rulesConfig = {}) {
        Object.keys(rules).forEach(key => {
            debug('use "%s" rule', key);
            const ruleCreator = rules[key];
            if (typeof ruleCreator !== 'function') {
                throw new Error(`Definition for rule '${ key }' was not found.`);
            }
            const ruleConfig = rulesConfig && rulesConfig[key];
            // "rule-name" : false => disable
            // TODO: move to RuleManager?
            if (ruleConfig === false) {
                return;
            }
            try {
                var ruleContext = new RuleContext(key, this.ruleContextAgent, this.config, ruleConfig);
                let rule = ruleCreator(ruleContext, ruleConfig);
                addListenRule(rule, this.ruleContextAgent);
            } catch (ex) {
                ex.message = `Error while loading rule '${ key }': ${ ex.message }`;
                throw ex;
            }
        });
    }

    /**
     * Remove all registered rule and clear messages.
     */
    resetRules() {
        this.ruleContextAgent.removeAllListeners();
    }

    _lintByProcessor(processor, text, ext, filePath) {
        assert(processor, `processor is not found for ${ext}`);
        this.ruleContextAgent.resetState(text);
        const {preProcess, postProcess} = processor.processor(ext);
        assert(typeof preProcess === "function" && typeof postProcess === "function",
            `processor should implement {preProcess, postProcess}`);
        const ast = preProcess(text, filePath);
        let that = this;
        traverseController.traverse(ast, {
            enter(node, parent) {
                Object.defineProperty(node, 'parent', {value: parent});
                that.ruleContextAgent.emit(node.type, node);
            },
            leave(node) {
                that.ruleContextAgent.emit(`${ node.type }:exit`, node);
            }
        });
        let messages = this.ruleContextAgent.messages;
        let result = postProcess(messages, filePath);
        if (result.filePath == null) {
            result.filePath = `<Unkown${ext}>`;
        }
        assert(result.filePath && result.messages.length >= 0, "postProcess should return { messages, filePath } ");
        return result;
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
}
