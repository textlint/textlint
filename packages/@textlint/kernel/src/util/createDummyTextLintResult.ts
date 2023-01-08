import { TextlintResult } from "@textlint/types";

// TODO: Fix can not support
/**
 * Create dummy TextLintResult
 * @param message
 * @param filePath
 */
export const createDummyTextLintResult = (message: string, filePath?: string): TextlintResult => {
    return {
        filePath: filePath ?? "<Unknown>",
        messages: [
            {
                message,
                type: "lint",
                loc: {
                    start: {
                        line: 1,
                        column: 0
                    },
                    end: {
                        line: 1,
                        column: 0
                    }
                },
                index: 0,
                line: 1,
                column: 0,
                range: [0, 1],
                severity: 2,
                ruleId: "plugin-error"
            }
        ]
    };
};
