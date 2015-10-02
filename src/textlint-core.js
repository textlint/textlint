// LICENSE : MIT
'use strict';
/*
    textlint-core.js is a class
    textlint.js is a singleton object that is instance of textlint-core.js.
 */
const objectAssign = require('object-assign');
const TraverseController = require('txt-ast-traverse').Controller;
const RuleContext = require('./rule/rule-context');
const ruleManager = require('./rule/rule-manager');
const isMarkdown = require('is-md');
const path = require('path');
const fs = require('fs');
const EventEmitter = require('events').EventEmitter;
const debug = require('debug')('text:core');
// add all the node types as listeners
function addListenRule(rule, target) {
    Object.keys(rule).forEach(nodeType => {
        target.on(nodeType, rule[nodeType]);
    });
}
export default class TextlintCore extends EventEmitter {
    constructor() {
        super();
        this.initializeForLinting();
    }

    initializeForLinting(text) {
        this.messages = [];
        this.currentText = text || "";
    }

    /**
     * Register rules to EventEmitter.
     * if want to release rules, please call {@link this.resetRules}.
     * @param {object} rules rule objects array
     * @param {object} [rulesConfig] ruleConfig is object
     * @param {TextLintConfig} [textLintConfig]
     */
    setupRules(rules, rulesConfig, textLintConfig) {
        Object.keys(rules).forEach(key => {
            debug('use "%s" rule', key);
            const ruleCreator = rules[key];
            if (typeof ruleCreator !== 'function') {
                throw new Error(`Definition for rule '${ key }' was not found.`);
            }
            let rule;
            const ruleConfig = rulesConfig && rulesConfig[key];
            // "rule-name" : false => disable
            // TODO: move to RuleManager?
            if (ruleConfig === false) {
                return;
            }
            try {
                rule = ruleCreator(new RuleContext(key, this, textLintConfig), ruleConfig);
                addListenRule(rule, this);
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
        this.removeAllListeners();
        ruleManager.resetRules();
        this.initializeForLinting();
    }

    /**
     * lint plain text by registered rules.
     * The result contains target filePath and error messages.
     * @param {string} text
     * @returns {TextLintResult}
     */
    lintText(text) {
        require('assert')(text.length > 0);
        this.initializeForLinting(text);
        const parse = require('txt-to-ast').parse;
        const ast = parse(text);
        const controller = new TraverseController();
        let that = this;
        controller.traverse(ast, {
            enter(node, parent) {
                Object.defineProperty(node, 'parent', {value: parent});
                that.emit(node.type, node);
            },
            leave(node) {
                that.emit(`${ node.type }:exit`, node);
            }
        });
        return {
            filePath: '<text>',
            messages: this.messages
        };
    }

    /**
     * lint markdown text by registered rules.
     * The result contains target filePath and error messages.
     * @param {string} markdown markdown format text
     * @returns {TextLintResult}
     */
    lintMarkdown(markdown) {
        require('assert')(markdown.length > 0);
        this.initializeForLinting(markdown);
        const parse = require('markdown-to-ast').parse;
        const ast = parse(markdown);
        const controller = new TraverseController();
        let that = this;
        controller.traverse(ast, {
            enter(node, parent) {
                Object.defineProperty(node, 'parent', {value: parent});
                that.emit(node.type, node);
            },
            leave(node) {
                that.emit(`${ node.type }:exit`, node);
            }
        });
        return {
            filePath: '<markdown>',
            messages: this.messages
        };
    }

    /**
     * lint file and return result object
     * @param {string} filePath
     * @returns {TextLintResult} result
     */
    lintFile(filePath) {
        const absoluteFilePath = path.resolve(process.cwd(), filePath);
        const text = fs.readFileSync(absoluteFilePath, 'utf-8');
        if (isMarkdown(filePath)) {
            return objectAssign(this.lintMarkdown(text), {filePath: absoluteFilePath});
        } else {
            return objectAssign(this.lintText(text), {filePath: absoluteFilePath});
        }
    }

    // ===== Export RuleContext
    /**
     * push new RuleError to results
     * @param {string} ruleId
     * @param {TxtNode} txtNode
     * @param {RuleError} error
     */
    pushReport(ruleId, txtNode, error) {
        debug('pushReport %s', error);
        this.messages.push(objectAssign({
            ruleId: ruleId,
            message: error.message,
            line: error.line ? txtNode.loc.start.line + error.line : txtNode.loc.start.line,
            column: error.column ? txtNode.loc.start.column + error.column : txtNode.loc.start.column,
            severity: 2
        }, txtNode));
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
            return currentText.slice(Math.max(node.range[0] - (beforeCount || 0), 0), node.range[1] + (afterCount || 0));
        } else {
            return currentText;
        }
    }
}