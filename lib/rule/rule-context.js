// LICENSE : MIT
"use strict";
function RuleContext(ruleId, textLint) {
    Object.defineProperty(this, "id", {
        value: ruleId
    });
    /**
     *
     * @param {TxtNode} node
     * @param {string} message
     */
    this.report = function (node, message) {
        textLint.pushReport(ruleId, node, message);
    };
    this.Syntax = require("../parse/markdown/markdown-syntax");
    this.getSource = textLint.getSource.bind(this);
}

module.exports = RuleContext;
