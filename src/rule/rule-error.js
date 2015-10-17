// LICENSE : MIT
'use strict';
class RuleError {
    /**
     * RuleError is like Error object.
     * It's used for adding to TextLintResult.
     * @param {string} message error message should start with lowercase letter
     * @param {object|number} [paddingLocation] - the object has padding {line, column} for actual error reason
     * @constructor
     */
    constructor(message, paddingLocation) {
        this.message = message;
        if (typeof paddingLocation === 'object') {
            // padding lineNumber
            this.line = paddingLocation.line;
            // padding column
            this.column = paddingLocation.column;
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
