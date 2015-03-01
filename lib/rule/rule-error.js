// LICENSE : MIT
"use strict";
/**
 * RuleError is like Error object.
 * It's used for adding to TextLintResult.
 * @param {string} message error message should start with lowercase letter
 * @param {object?} paddingLocation - the object has padding {line, column} for actual error reason
 * @constructor
 */
function RuleError(message, paddingLocation) {
    this.message = message;
    if (typeof paddingLocation === "object") {
        this.line = paddingLocation.line;// start with 0
        this.column = paddingLocation.column;// start with 0
    } else if (typeof paddingLocation === "number") {
        // this is deprecated
        // should pass padding as object.
        this.column = paddingLocation;
    }
}
RuleError.prototype.toString = function () {
    return "<RuleError>"
        + "" + this.message
        + " @:"
        + (this.line ? this.line + ":" : "")
        + (this.column ? this.column + ":" : "");

};

module.exports = RuleError;