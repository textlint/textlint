// LICENSE : MIT
"use strict";
import { describe, it } from "vitest";
import * as assert from "node:assert";
import type { TextlintMessage } from "@textlint/types";
import createSeverityFilter, { filterWarningMessages, through } from "../../src/messages/filter-severity-process.js";
import { TextlintRuleSeverityLevelKeys } from "../../src/context/TextlintRuleSeverityLevelKeys.js";

// Helper function to create a minimal TextlintMessage
function createMessage(ruleId: string, severity: number, message: string, line = 1): TextlintMessage {
    return {
        type: "lint",
        ruleId,
        line,
        column: 1,
        index: 0,
        range: [0, 1] as [number, number],
        loc: { start: { line, column: 1 }, end: { line, column: 2 } },
        severity: severity as 1 | 2 | 3,
        message
    };
}

describe("filter-severity-process", function () {
    describe("filterWarningMessages", function () {
        it("should filter out warning messages (severity 1)", function () {
            const messages: TextlintMessage[] = [
                createMessage("rule-error", TextlintRuleSeverityLevelKeys.error, "This is an error", 1),
                createMessage("rule-warning", TextlintRuleSeverityLevelKeys.warning, "This is a warning", 2)
            ];
            const filteredMessages = filterWarningMessages(messages);
            assert.strictEqual(filteredMessages.length, 1);
            assert.strictEqual(filteredMessages[0].ruleId, "rule-error");
            assert.strictEqual(filteredMessages[0].severity, TextlintRuleSeverityLevelKeys.error);
        });

        it("should filter out info messages (severity 3)", function () {
            const messages: TextlintMessage[] = [
                createMessage("rule-error", TextlintRuleSeverityLevelKeys.error, "This is an error", 1),
                createMessage("rule-info", TextlintRuleSeverityLevelKeys.info, "This is an info", 2)
            ];
            const filteredMessages = filterWarningMessages(messages);
            assert.strictEqual(filteredMessages.length, 1);
            assert.strictEqual(filteredMessages[0].ruleId, "rule-error");
            assert.strictEqual(filteredMessages[0].severity, TextlintRuleSeverityLevelKeys.error);
        });

        it("should filter out both warning and info messages, keeping only errors", function () {
            const messages: TextlintMessage[] = [
                createMessage("rule-error-1", TextlintRuleSeverityLevelKeys.error, "This is error 1", 1),
                createMessage("rule-warning", TextlintRuleSeverityLevelKeys.warning, "This is a warning", 2),
                createMessage("rule-error-2", TextlintRuleSeverityLevelKeys.error, "This is error 2", 3),
                createMessage("rule-info", TextlintRuleSeverityLevelKeys.info, "This is an info", 4)
            ];
            const filteredMessages = filterWarningMessages(messages);
            assert.strictEqual(filteredMessages.length, 2);
            assert.strictEqual(filteredMessages[0].ruleId, "rule-error-1");
            assert.strictEqual(filteredMessages[1].ruleId, "rule-error-2");
            filteredMessages.forEach((message) => {
                assert.strictEqual(message.severity, TextlintRuleSeverityLevelKeys.error);
            });
        });

        it("should return empty array when no error messages exist", function () {
            const messages: TextlintMessage[] = [
                createMessage("rule-warning", TextlintRuleSeverityLevelKeys.warning, "This is a warning", 1),
                createMessage("rule-info", TextlintRuleSeverityLevelKeys.info, "This is an info", 2)
            ];
            const filteredMessages = filterWarningMessages(messages);
            assert.strictEqual(filteredMessages.length, 0);
        });

        it("should handle empty array", function () {
            const filteredMessages = filterWarningMessages([]);
            assert.strictEqual(filteredMessages.length, 0);
        });

        it("should handle undefined input", function () {
            const filteredMessages = filterWarningMessages();
            assert.strictEqual(filteredMessages.length, 0);
        });
    });

    describe("through", function () {
        it("should pass through all messages unchanged", function () {
            const messages: TextlintMessage[] = [
                createMessage("rule-error", TextlintRuleSeverityLevelKeys.error, "This is an error", 1),
                createMessage("rule-warning", TextlintRuleSeverityLevelKeys.warning, "This is a warning", 2),
                createMessage("rule-info", TextlintRuleSeverityLevelKeys.info, "This is an info", 3)
            ];
            const result = through(messages);
            assert.strictEqual(result.length, 3);
            assert.deepStrictEqual(result, messages);
        });
    });

    describe("createSeverityFilter", function () {
        it("should return filterWarningMessages when quiet mode is enabled", function () {
            const config = { quiet: true };
            const filter = createSeverityFilter(config);

            const messages: TextlintMessage[] = [
                createMessage("rule-error", TextlintRuleSeverityLevelKeys.error, "This is an error", 1),
                createMessage("rule-warning", TextlintRuleSeverityLevelKeys.warning, "This is a warning", 2),
                createMessage("rule-info", TextlintRuleSeverityLevelKeys.info, "This is an info", 3)
            ];

            const filteredMessages = filter(messages);
            assert.strictEqual(filteredMessages.length, 1);
            assert.strictEqual(filteredMessages[0].ruleId, "rule-error");
            assert.strictEqual(filteredMessages[0].severity, TextlintRuleSeverityLevelKeys.error);
        });

        it("should return through function when quiet mode is disabled", function () {
            const config = { quiet: false };
            const filter = createSeverityFilter(config);

            const messages: TextlintMessage[] = [
                createMessage("rule-error", TextlintRuleSeverityLevelKeys.error, "This is an error", 1),
                createMessage("rule-warning", TextlintRuleSeverityLevelKeys.warning, "This is a warning", 2),
                createMessage("rule-info", TextlintRuleSeverityLevelKeys.info, "This is an info", 3)
            ];

            const filteredMessages = filter(messages);
            assert.strictEqual(filteredMessages.length, 3);
            assert.deepStrictEqual(filteredMessages, messages);
        });

        it("should default to through function when quiet property is not set", function () {
            const config = {};
            const filter = createSeverityFilter(config);

            const messages: TextlintMessage[] = [
                createMessage("rule-info", TextlintRuleSeverityLevelKeys.info, "This is an info", 1)
            ];

            const filteredMessages = filter(messages);
            assert.strictEqual(filteredMessages.length, 1);
            assert.deepStrictEqual(filteredMessages, messages);
        });
    });
});
