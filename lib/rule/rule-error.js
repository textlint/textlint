// LICENSE : MIT
"use strict";
/**
 * RuleError is like Error object.
 * It's used for adding to TextLintResult.
 * @param {string} message error message should start with lowercase letter
 * @param {number?} paddingX - index value of char which is actual error reason.
 * @constructor
 */
function RuleError(message, paddingX) {
    this.message = message;
    this.column = paddingX;
}
RuleError.prototype.toString = function () {
    return "<RuleError>"
        + "" + this.message
        + " @::"
        + (this.column ? this.column + ":" : "");

};

module.exports = RuleError;