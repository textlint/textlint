// LICENSE : MIT
"use strict";
/**
 * @typedef {Object} RuleError~Padding
 * @property {number} line
 * @property {number} column
 * @property {Object} fix
 */
class RuleError {
    /**
     * RuleError is like Error object.
     * It's used for adding to TextLintResult.
     * @param {string} message error message should start with lowercase letter
     * @param {RuleError~Padding|number} [paddingLocation] - the object has padding {line, column} for actual error reason
     * @constructor
     */
    constructor(message, paddingLocation) {
        this.message = message;
        if (typeof paddingLocation === "object") {
            /**
             * padding lineNumber
             * @type {number}
             */
            this.line = paddingLocation.line;
            /**
             * padding column
             * @type {number}
             */
            this.column = paddingLocation.column;
            /**
             * padding index
             * @type {number}
             */
            this.index = paddingLocation.index;
            /**
             * fixCommand object
             * @type {FixCommand}
             */
            this.fix = paddingLocation.fix;
        } else if (typeof paddingLocation === "number") {
            // this is deprecated
            // should pass padding as object.
            this.column = paddingLocation;
        }
    }

    toString() {
        return JSON.stringify({
            line: this.line,
            column: this.column,
            index: this.index,
            fix: this.fix
        });
    }
}
module.exports = RuleError;
