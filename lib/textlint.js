// LICENSE : MIT
"use strict";
/*
    Workflow
    - load rules
    - addEventLister each **event** of rule
    - parse text to AST(TxtNode)
    - traverse ast -> emit **event**
        - report(push message)
    - display messages with formatter
 */
var objectAssign = require("object-assign");
var traverse = require('traverse');
var RuleContext = require("./rule/rule-context");
var ruleManger = require("./rule/rule-manager");
var path = require("path");
var fs = require("fs");
var EventEmitter = require("events").EventEmitter;
var debug = require("debug")("text:core");
var messages = [],
    currentText = null;
var api = Object.create(new EventEmitter());
// add all the node types as listeners
function addListenRule(rule, target) {
    Object.keys(rule).forEach(function (nodeType) {
        target.on(nodeType, rule[nodeType]);
    });
}
/**
 * setup rules
 * if want to reset, please call `resetRules`.
 * @param {Array} rules rule objects array
 */
api.setupRules = function (rules) {
    Object.keys(rules).forEach(function (key) {
        var ruleCreator = rules[key];
        if (typeof ruleCreator !== "function") {
            throw new Error("Definition for rule '" + key + "' was not found.");
        }
        var rule;
        try {
            rule = ruleCreator(new RuleContext(key, api));
            addListenRule(rule, api);
        } catch (ex) {
            ex.message = "Error while loading rule '" + key + "': " + ex.message;
            throw ex;
        }
    });
};
/*
    reset all rules and clear messages.
 */
api.resetRules = function () {
    this.removeAllListeners();
    ruleManger.resetRules();
    messages = [];
};
/**
 * lint text
 * @param {string} text
 * @returns {TextLintResult}
 */
api.lintText = function (text) {
    require("assert")(text.length > 0);
    currentText = text;
    var ast = require("./parse/plaintext/plaintext-parser")(text);
    traverse(ast).forEach(function (x) {
        if (this.notLeaf && typeof x.type !== "undefined") {
            api.emit(x.type, x);
        }
    });
    return {
        filePath: "<text>",
        messages: messages
    };
};
/**
 * lint markdown text
 * @param {string} markdown
 * @returns {TextLintResult}
 */
api.lintMarkdown = function (markdown) {
    require("assert")(markdown.length > 0);
    currentText = markdown;
    var ast = require("./parse/markdown/markdown-parser")(markdown);
    traverse(ast).forEach(function (x) {
        if (this.notLeaf && typeof x.type !== "undefined") {
            api.emit(x.type, x);
        }
    });
    return {
        filePath: "<text>",
        messages: messages
    };
};

/**
 * lint file and return result object
 * @param {string} filePath
 * @returns {TextLintResult} result
 */
api.lintFile = function (filePath) {
    var absoluteFilePath = path.resolve(process.cwd(), filePath);
    var text = fs.readFileSync(absoluteFilePath, "utf-8");
    if (require("./file-type").isMarkdown(filePath)) {
        return objectAssign(api.lintMarkdown(text), {
            filePath: absoluteFilePath
        });
    } else {
        return objectAssign(api.lintText(text), {
            filePath: absoluteFilePath
        });
    }
};

/**
 * push new RuleError to results
 * @param {string} ruleId
 * @param {TxtNode} txtNode
 * @param {RuleError} error
 */
api.pushReport = function (ruleId, txtNode, error) {
    debug("api.pushReport %s", error);
    messages.push(objectAssign({
        id: ruleId,
        message: error.message,
        line: txtNode.loc.start.line,
        column: error.column ? txtNode.loc.start.column + error.column : txtNode.loc.start.column,
        severity: 2
    }, txtNode));
};

/**
 * Gets the source code for the given node.
 * @param {TxtNode=} node The AST node to get the text for.
 * @param {int=} beforeCount The number of characters before the node to retrieve.
 * @param {int=} afterCount The number of characters after the node to retrieve.
 * @returns {string} The text representing the AST node.
 */
api.getSource = function (node, beforeCount, afterCount) {
    if (node) {
        return (currentText !== null)
            ? currentText.slice(Math.max(node.range[0] - (beforeCount || 0), 0), node.range[1] + (afterCount || 0))
            : null;
    } else {
        return currentText;
    }

};
module.exports = api;
