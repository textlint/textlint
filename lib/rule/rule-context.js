// LICENSE : MIT
"use strict";
function RuleContext(ruleId, textLint) {
    Object.defineProperty(this, "id", {
        value: ruleId
    });
    /**
     *
     * @param {TxtNode} node
     * @param {RuleError} error
     */
    this.report = function (node, error) {
        textLint.pushReport(ruleId, node, error);
    };
    // Const Values
    this.Syntax = require("../parse/markdown/markdown-syntax");
    // Utils
    this.getSource = textLint.getSource.bind(this);
    this.RuleError = require("./rule-error");
}

module.exports = RuleContext;
