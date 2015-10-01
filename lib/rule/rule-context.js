// LICENSE : MIT
'use strict';
function RuleContext(ruleId, textLint, textLintConfig) {
    Object.defineProperty(this, 'id', { value: ruleId });
    Object.defineProperty(this, 'config', { value: textLintConfig });
    /**
     *
     * @param {TxtNode} node
     * @param {RuleError} error
     */
    this.report = function (node, error) {
        textLint.pushReport(ruleId, node, error);
    };
    // Const Values
    this.Syntax = require('../parser/union-syntax');
    /** {@link textLint.getSource} */
    this.getSource = textLint.getSource.bind(this);
    // CustomError object
    this.RuleError = require('./rule-error');
}
module.exports = RuleContext;
//# sourceMappingURL=rule-context.js.map