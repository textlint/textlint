// LICENSE : MIT
"use strict";

import type { TextlintRuleContextFixCommand, TextlintRuleErrorDetails, TextlintRuleError } from "@textlint/types";
import { TextlintRuleErrorPaddingLocation } from "@textlint/types";

export class TextlintRuleErrorImpl implements TextlintRuleError {
    public message: string;
    /**
     * @deprecated use `padding` property
     */
    public readonly line?: number;
    /**
     * @deprecated use `padding` property
     */
    public readonly column?: number;
    /**
     * @deprecated use `padding` property
     */
    public readonly index?: number;
    /**
     * padding location object
     * You can create padding value using `locator`
     */
    public readonly padding?: TextlintRuleErrorPaddingLocation;
    public readonly fix?: TextlintRuleContextFixCommand;

    /**
     * RuleError is like Error object.
     * It's used for adding to TextlintResult.
     * @param message error message should start with lowercase letter
     * @param [details] - the object has padding and fix info
     * @constructor
     */
    constructor(message: string, details?: number | TextlintRuleErrorDetails) {
        this.message = message;
        if (typeof details === "object") {
            /**
             * padding lineNumber
             * @type {number}
             */
            this.line = details.line;
            /**
             * padding column
             * @type {number}
             */
            this.column = details.column;
            /**
             * padding index
             * @type {number}
             */
            this.index = details.index;
            /**
             * fixCommand object
             * @type {TextlintRuleContextFixCommand}
             */
            this.fix = details.fix;
            /**
             * padding location object
             */
            this.padding = details.padding;
        } else if (typeof details === "number") {
            // this is deprecated
            // should pass padding as object.
            this.column = details;
        }
    }

    toString() {
        return JSON.stringify({
            message: this.message,
            line: this.line,
            column: this.column,
            index: this.index,
            fix: this.fix
        });
    }
}
