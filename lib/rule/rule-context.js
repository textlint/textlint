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
    this.Syntax = require("../parse/union-syntax");

    /** {@link textLint.getSource} */
    this.getSource = textLint.getSource.bind(this);
    // CustomError object
    this.RuleError = require("./rule-error");
}

module.exports = RuleContext;
