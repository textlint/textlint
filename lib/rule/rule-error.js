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
module.exports = RuleError;