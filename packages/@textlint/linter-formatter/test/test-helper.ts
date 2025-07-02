import type { TextlintMessage, TextlintResult } from "@textlint/types";

// Helper to create test message with minimal required properties
export function createTestMessage(overrides: Partial<TextlintMessage> & { fatal?: boolean } = {}): TextlintMessage & { fatal?: boolean } {
    return {
        type: "lint",
        ruleId: "",
        message: "",
        line: 1,
        column: 1,
        index: 0,
        range: [0, 1] as const,
        loc: {
            start: { line: 1, column: 1 },
            end: { line: 1, column: 1 }
        },
        severity: 1,
        ...overrides
    };
}

// Helper to create test result with minimal required properties
export function createTestResult(overrides: Partial<TextlintResult> = {}): TextlintResult {
    return {
        filePath: "test.js",
        messages: [],
        ...overrides
    };
}