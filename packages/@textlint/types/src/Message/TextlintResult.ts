// "range" will be replaced by "text"
import { TextlintRuleSeverityLevel } from "../Rule/TextlintRuleSeverityLevel.js";

export interface TextlintMessageFixCommand {
    text: string;
    range: readonly [startIndex: number, endIndex: number];
}

export interface TextlintMessage {
    // See src/shared/type/MessageType.js
    // Message Type
    type: string;
    // Rule Id
    ruleId: string;
    message: string;
    // optional data
    data?: unknown;
    // FixCommand
    fix?: TextlintMessageFixCommand;
    /**
     * start line number where the issue is located.
     * start with 1
     * @deprecated use `loc`
     */
    line: number;
    /**
     * start column number where the issue is located.
     * start with 1
     * @deprecated use `loc`
     */
    column: number;
    /**
     * start index where the issue is located.
     * start with 0
     * @deprecated use `range`
     */
    index: number;
    /**
     * the range info where the issue is located.
     * range start with 0
     * Note: `range` represent same info to `loc`
     */
    range: readonly [startIndex: number, endIndex: number];
    /**
     * the location info where the issue is located.
     * line start with 1
     * column start with 1
     * Note: `loc` represent same info to `range`
     */
    loc: {
        start: {
            line: number;
            column: number;
        };
        end: {
            line: number;
            column: number;
        };
    };
    // Severity Level
    // See src/shared/type/SeverityLevel.js
    severity: TextlintRuleSeverityLevel;
}

// Linting result
export interface TextlintResult {
    filePath: string;
    messages: TextlintMessage[];
}

// Fixing result
export interface TextlintFixResult {
    filePath: string;
    // fixed content
    output: string;
    // all messages = pre-applyingMessages + remainingMessages
    // it is same with one of `TextlintResult`
    messages: TextlintMessage[];
    // applied fixable messages
    applyingMessages: TextlintMessage[];
    // original means original for applyingMessages and remainingMessages
    // pre-applyingMessages + remainingMessages
    remainingMessages: TextlintMessage[];
}
