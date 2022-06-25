// LICENSE : MIT
"use strict";

import type { TextlintRuleContextFixCommand, TextlintRuleErrorDetails, TextlintRuleError } from "@textlint/types";
import { TextlintRuleErrorPaddingLocation } from "@textlint/types";
import { throwIfTesting } from "@textlint/feature-flag";
import { isTextlintRuleErrorPaddingLocation } from "./TextlintRulePaddingLocator";

const assertTextlintRuleErrorDetail = (details: TextlintRuleErrorDetails) => {
    // reject wrong usage
    if ("at" in details) {
        throw new Error(
            `RuleError details should not have "loc" property. Please use { padding: locator.at(index) } instead.`
        );
    }
    if ("range" in details) {
        throw new Error(
            `RuleError details should not have "range" property. Please use { padding: locator.range([start, end]) } instead.`
        );
    }
    if ("loc" in details) {
        throw new Error(
            `RuleError details should not have "loc" property. Please use { padding: locator.loc({ start, end }) } instead.`
        );
    }
    // wrong mixed usage
    const useIndex = "index" in details;
    const useLineColumn = "line" in details || "column" in details;
    const usePadding = "padding" in details;
    if ([useIndex, useLineColumn, usePadding].filter(Boolean).length > 1) {
        throwIfTesting(`RuleError details can not mixed usage: ${JSON.stringify(details)}

You have set { index, line, column, padding } at same time.        
`);
    }
    // legacy usage
    if (useIndex) {
        if (typeof details.index !== "number" || Number.isNaN(details.index)) {
            throwIfTesting(`index should be number: ${JSON.stringify(details)}`);
        }
        return;
    }

    if (useLineColumn) {
        // TODO: make throw error in next version
        const shouldHaveLineAndColumn = "line" in details && "column" in details;
        if (!shouldHaveLineAndColumn) {
            throwIfTesting("line and column should be set both");
        }
        if (typeof details.line !== "number" || Number.isNaN(details.line)) {
            throwIfTesting(`line should be number: ${JSON.stringify(details)}`);
        }
        if (typeof details.column !== "number" || Number.isNaN(details.column)) {
            throwIfTesting(`column should be number: ${JSON.stringify(details)}`);
        }
        return;
    }
    // modern usage
    if (usePadding) {
        // padding assertion is done in locator function
        if (!isTextlintRuleErrorPaddingLocation(details.padding)) {
            throwIfTesting(`padding should be created locator function: ${JSON.stringify(details)}`);
        }
        return;
    }
};

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
            assertTextlintRuleErrorDetail(details);
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
