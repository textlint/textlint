// LICENSE : MIT
'use strict';
/*
    textlint-core.js is a class
    textlint.js is a singleton object that is instance of textlint-core.js.
 */
const objectAssign = require('object-assign');
const TraverseController = require('txt-ast-traverse').Controller;
const RuleContext = require('./rule/rule-context');
const isMarkdown = require('is-md');
const path = require('path');
const fs = require('fs');
const EventEmitter = require('events').EventEmitter;
const UnionSyntax = require("./parser/union-syntax");
const debug = require('debug')('textlint:core');
import {getProcessorMatchExtension} from "./plugins/proccesor-helper";
import MarkdownProcessor from "./plugins/markdown/MarkdownProcessor";
import TextProcessor from "./plugins/text/TextProcessor";
import HTMLProcessor from "./plugins/html/HTMLProcessor";
// add all the node types as listeners
function addListenRule(rule, target) {
    Object.keys(rule).forEach(nodeType => {
        target.on(nodeType, rule[nodeType]);
    });
}

/**
 * The Agent communicate between RuleContext and Rules.
 */
class RuleContextAgent extends EventEmitter {

    constructor(text) {
        super();
        // set unlimited listeners (see https://github.com/azu/textlint/issues/33)
        this.setMaxListeners(0);
        this.messages = [];
        this.currentText = text || "";
    }

    resetState(text = "") {
        this.currentText = text;
        this.messages = [];
    }

    /**
     * push new RuleError to results
     * @param {string} ruleId
     * @param {TxtNode} node
     * @param {number} severity
     * @param {RuleError} error
     */
    pushReport({ruleId, node, severity, error}) {
        debug('pushReport %s', error);
        var lineNumber = error.line ? node.loc.start.line + error.line : node.loc.start.line;
        var columnNumber = error.column ? node.loc.start.column + error.column : node.loc.start.column;
        // add TextLintMessage
        var message = {
            ruleId: ruleId,
            message: error.message,
            // See https://github.com/azu/textlint/blob/master/typing/textlint.d.ts
            line: lineNumber,        // start with 1(1-based line number)
            column: columnNumber + 1,// start with 1(1-based column number)
            severity: severity // it's for compatible ESLint formatter
        };
        this.messages.push(message);
    }

    // TODO: allow to use Syntax which is defined by Plugin Processor.
    getSyntax() {
        return UnionSyntax;
    }

    /**
     * Gets the source code for the given node.
     * @param {TxtNode=} node The AST node to get the text for.
     * @param {int=} beforeCount The number of characters before the node to retrieve.
     * @param {int=} afterCount The number of characters after the node to retrieve.
     * @returns {string|null} The text representing the AST node.
     */
    getSource(node, beforeCount, afterCount) {
        let currentText = this.currentText;
        if (currentText == null) {
            return null;
        }
        if (node) {
            let start = Math.max(node.range[0] - (beforeCount || 0), 0);
            let end = node.range[1] + (afterCount || 0);
            return currentText.slice(start, end);
        } else {
            return currentText;
        }
    }
}

export default class TextlintCore {
    constructor(config) {
        // this.config often is undefined.
        this.config = config || {};
        // FIXME: in the future, this.processors is empty by default.
        // Markdown and Text are for backward compatibility.
        this.processors = [
            new MarkdownProcessor(config),
            new TextProcessor(config),
            new HTMLProcessor(config)
        ];
        this.ruleContextAgent = new RuleContextAgent();
    }

    // Unstable API
    _setupProcessors(processorConstructors, textLintConfig) {
        this.config = textLintConfig;
        this.processors = processorConstructors.map(Processtor => {
            return new Processtor(textLintConfig);
        });
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
        require('assert')(processor, `processor is not found for ${ext}`);
        this.ruleContextAgent.resetState(text);
        const {preProcess, postProcess} = processor.processor(ext);
        const ast = preProcess(text, filePath);
        const controller = new TraverseController();
        let that = this;
        controller.traverse(ast, {
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
