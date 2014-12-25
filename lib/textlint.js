// LICENSE : MIT
"use strict";
/*

    - load rules
    - addEventLister each **event** of rule
    - parse text to AST(TxtNode)
    - traverse ast -> emit **event**
        - report(push message)
    - display messages
 */
var objectAssign = require("object-assign");
var traverse = require('traverse');
var RuleContext = require("./RuleContext");
var path = require("path");
var fs = require("fs");
var EventEmitter = require("events").EventEmitter;
var messages = [];
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
    messages = [];
};
api.lintText = function (text) {

};
api.lintMarkdown = function (markdown) {
    require("assert")(markdown.length > 0);
    var ast = require("./parse/markdown-parser")(markdown);
    traverse(ast).forEach(function (x) {
        if (this.notLeaf) {
            api.emit(x.t, x);
        }
    });
    return {
        filePath: "<text>",
        messages: messages
    };
};
function isMarkdown(filePath) {
    var extname = path.extname(filePath).toLowerCase();
    if (extname === ".md" || extname === ".mdown" || extname === ".markdown" || extname === ".mkd" || extname === ".mkdn") {
        return true;
    }
}
api.lintFile = function (filePath) {
    var absoluteFilePath = path.resolve(process.cwd(), filePath);
    var text = fs.readFileSync(absoluteFilePath, "utf-8");
    if (isMarkdown(filePath)) {
        return objectAssign(api.lintMarkdown(text), {
            filePath: absoluteFilePath
        });
    } else {
        throw new Error("NOT IMPLEMENT");
        return {};
    }

};
api.pushReport = function (ruleId, txtNode, message) {
    messages.push(objectAssign({
        id: ruleId,
        message: message,
        line: txtNode.loc.start.line,
        column: txtNode.loc.start.column,
        severity: 2
    }, txtNode));
};

module.exports = api;
