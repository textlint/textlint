// LICENSE : MIT
"use strict";
/**
 * RuleError object
 * @param {string} message
 * @param {number?} line
 * @param {number?} column
 * @constructor
 */
function RuleError(message, line, column) {
    this.message = message;
    this.line = line;
    this.column = column;
}
RuleError.prototype.toString = function () {
    return "<RuleError>"
        + "" + this.message
        + " @::"
        + (this.line ? this.line + ":" : "")
        + (this.column ? this.column + ":" : "");

};

module.exports = RuleError;