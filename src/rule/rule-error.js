// LICENSE : MIT
'use strict';
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
        if (typeof paddingLocation === 'object') {
            // padding lineNumber
            this.line = paddingLocation.line;
            // padding column
            this.column = paddingLocation.column;
            // fixCommand object
            this.fix = paddingLocation.fix;
        } else if (typeof paddingLocation === 'number') {
            // this is deprecated
            // should pass padding as object.
            this.column = paddingLocation;
        }
    }

    toString() {
        let position = `${ this.line ? this.line + ':' : '' }${ this.column ? this.column + ':' : '' }`;
        return `${ this.column }:${ this.line }:<RuleError>${ this.message } @:${position}`;
    }
}
module.exports = RuleError;
