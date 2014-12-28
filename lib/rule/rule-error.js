// LICENSE : MIT
"use strict";
/**
 * RuleError object
 * @param {string} message
 * @param {number?} paddingX - start point x of error message
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