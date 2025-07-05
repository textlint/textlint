import { z } from "zod";

/**
 * Zod schema for TextlintMessage that matches the TextlintMessage interface
 * from @textlint/types
 */
export const TextlintMessageSchema = z.object({
    // Core properties
    ruleId: z.string().optional(),
    message: z.string(),
    line: z.number().describe("Line number (1-based)"),
    column: z.number().describe("Column number (1-based)"),
    severity: z.number().describe("Severity level: 1=warning, 2=error, 3=info"),
    fix: z
        .object({
            range: z.array(z.number()).describe("Text range [start, end] (0-based)"),
            text: z.string().describe("Replacement text")
        })
        .optional()
        .describe("Fix suggestion if available"),
    // Additional TextlintMessage properties
    type: z.string().optional().describe("Message type"),
    data: z.unknown().optional().describe("Optional data associated with the message"),
    index: z.number().optional().describe("Start index where the issue is located (0-based, deprecated)"),
    range: z.array(z.number()).length(2).optional().describe("Text range [start, end] (0-based)"),
    loc: z
        .object({
            start: z.object({
                line: z.number().describe("Start line number (1-based)"),
                column: z.number().describe("Start column number (1-based)")
            }),
            end: z.object({
                line: z.number().describe("End line number (1-based)"),
                column: z.number().describe("End column number (1-based)")
            })
        })
        .optional()
        .describe("Location info where the issue is located")
});

/**
 * Zod schema for TextlintResult
 */
export const TextlintResultSchema = z.object({
    filePath: z.string(),
    messages: z.array(TextlintMessageSchema),
    output: z.string().optional().describe("Fixed content if available")
});

/**
 * Zod schema for TextlintFixResult
 */
export const TextlintFixResultSchema = z.object({
    filePath: z.string(),
    output: z.string().describe("Fixed content"),
    messages: z.array(TextlintMessageSchema),
    applyingMessages: z.array(TextlintMessageSchema),
    remainingMessages: z.array(TextlintMessageSchema)
});
