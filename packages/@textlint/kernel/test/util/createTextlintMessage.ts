import type { TextlintMessage } from "@textlint/types";
import createDummySourceCode from "./dummy-source-code.js";
import { resolveLocation } from "../../src/core/source-location.js";
import { TextlintRuleErrorImpl } from "../../src/context/TextlintRuleErrorImpl.js";
import { createPaddingLocator } from "../../src/context/TextlintRulePaddingLocator.js";
import { IgnoreReportedMessage } from "../../src/task/textlint-core-task.js";

/**
 * Create TextlintMessage from text and base message
 * @param text
 * @param message
 */
export const createTextlintMessage = (
    text: string,
    message: Omit<TextlintMessage, "type" | "data" | "line" | "column" | "index" | "loc" | "severity">
): TextlintMessage => {
    const source = createDummySourceCode(text);
    const { range, loc } = resolveLocation({
        source,
        node: source.ast,
        ruleId: message.ruleId,
        ruleError: new TextlintRuleErrorImpl(message.message, {
            padding: createPaddingLocator().range(message.range)
        })
    });
    return {
        ...message,
        type: "lint",
        index: range[0],
        line: loc.start.line, // start with 1(1-based line number)
        column: loc.start.column + 1, // start with 1(1-based column number)
        range,
        loc,
        severity: 2 // Error by default
    };
};

/**
 * Create IgnoreReportedMessage
 * @param message
 */
export const createIgnoreReportedMessage = (message: Omit<IgnoreReportedMessage, "type">): IgnoreReportedMessage => {
    return {
        ...message,
        type: "ignore"
    };
};
