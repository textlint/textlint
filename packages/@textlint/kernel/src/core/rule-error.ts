// LICENSE : MIT
"use strict";
import { TextLintFixCommand } from "../textlint-kernel-interface";

export interface RuleErrorPadding {
    line?: number;
    column?: number;
    index?: number;
    fix?: TextLintFixCommand;
}

export default class RuleError {
    public message: string;
    private line?: number;
    private column?: number;
    private index?: number;
    private fix?: TextLintFixCommand;

    /**
     * RuleError is like Error object.
     * It's used for adding to TextlintResult.
     * @param {string} message error message should start with lowercase letter
     * @param {RuleError~Padding|number} [paddingLocation] - the object has padding {line, column} for actual error reason
     * @constructor
     */
    constructor(message: string, paddingLocation?: number | RuleErrorPadding) {
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
