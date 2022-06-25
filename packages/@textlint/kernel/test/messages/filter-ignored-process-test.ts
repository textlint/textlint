// LICENSE : MIT
"use strict";
import filterMessages from "../../src/messages/filter-ignored-process";
import * as assert from "assert";
import { createIgnoreReportedMessage, createTextlintMessage } from "../util/createTextlintMessage";

// 9 character in each lines
const MULTILINE_TEXT = `1st line.
2nd line.
3rd line.
4th line.
5th line.`;
describe("message-filter", function () {
    context("when pass empty messages", function () {
        it("should return empty messages", function () {
            assert.equal(filterMessages([]).length, 0);
        });
    });
    context("when only lint messages", function () {
        it("should not change messages", function () {
            const messages = [
                createTextlintMessage(MULTILINE_TEXT, {
                    ruleId: "rule",
                    message: "message",
                    range: [0, 1]
                })
            ];
            assert.equal(filterMessages(messages).length, 1);
            assert.deepEqual(filterMessages(messages), messages);
        });
    });
    // Both(start and end) are contained: ignored
    // Overlap: ignored
    // Over point at least one(start or end): not ignored
    // For more details in
    // https://github.com/textlint/textlint/issues/835#issuecomment-1001287841
    context("when contain ignore messages", function () {
        it("should not filtered, if start index < ignored's range start ", function () {
            const messages = [
                createTextlintMessage(MULTILINE_TEXT, {
                    ruleId: "rule",
                    message: "message",
                    range: [0, 1]
                }),
                createIgnoreReportedMessage({ ruleId: "rule", range: [1, 2], ignoringRuleId: "*" })
            ];
            assert.equal(filterMessages(messages).length, 1);
        });
        it("should not filtered, if end index > ignored's range end", function () {
            const messages = [
                createTextlintMessage(MULTILINE_TEXT, {
                    ruleId: "rule",
                    message: "message",
                    range: [9, 11]
                }),
                createIgnoreReportedMessage({ ruleId: "rule", range: [5, 10], ignoringRuleId: "*" })
            ];
            assert.strictEqual(filterMessages(messages).length, 1);
        });
        it("should filtered, if ignore's start <= [start, end] <= ignore's end ", function () {
            const messages = [
                createTextlintMessage(MULTILINE_TEXT, {
                    ruleId: "rule",
                    message: "message",
                    range: [MULTILINE_TEXT.indexOf("1st"), MULTILINE_TEXT.indexOf("1st") + "1st".length]
                }),
                // remove
                createTextlintMessage(MULTILINE_TEXT, {
                    ruleId: "rule",
                    message: "message",
                    range: [MULTILINE_TEXT.indexOf("2nd"), MULTILINE_TEXT.indexOf("2nd") + "2nd".length]
                }),
                // remove - start and end is overlap
                createTextlintMessage(MULTILINE_TEXT, {
                    ruleId: "rule",
                    message: "message",
                    range: [MULTILINE_TEXT.indexOf("2nd line"), MULTILINE_TEXT.indexOf("2nd line") + "2nd line".length]
                }),
                createTextlintMessage(MULTILINE_TEXT, {
                    ruleId: "rule",
                    message: "message",
                    range: [MULTILINE_TEXT.indexOf("3rd"), MULTILINE_TEXT.indexOf("3rd") + "3rd".length]
                }),
                createIgnoreReportedMessage({
                    ruleId: "rule",
                    range: [MULTILINE_TEXT.indexOf("2nd line"), MULTILINE_TEXT.indexOf("2nd line") + "2nd line".length],
                    ignoringRuleId: "*"
                })
            ];
            assert.strictEqual(filterMessages(messages).length, 2);
            assert.deepStrictEqual(filterMessages(messages), [messages[0], messages[3]]);
        });
        it("should not filter message that over ignore range's start or end", function () {
            const messages = [
                createTextlintMessage(MULTILINE_TEXT, {
                    ruleId: "rule",
                    message: "message",
                    range: [0, 15]
                }),
                createTextlintMessage(MULTILINE_TEXT, {
                    ruleId: "rule",
                    message: "message",
                    range: [15, 25]
                }),
                createIgnoreReportedMessage({ ruleId: "rule", range: [10, 20], ignoringRuleId: "*" })
            ];
            assert.equal(filterMessages(messages).length, 2);
        });
        it("should not filter message that out of ignore range", function () {
            const messages = [
                createTextlintMessage(MULTILINE_TEXT, {
                    ruleId: "rule",
                    message: "message",
                    range: [10, 15]
                }),
                createTextlintMessage(MULTILINE_TEXT, {
                    ruleId: "rule",
                    message: "message",
                    range: [31, 35]
                }),
                createIgnoreReportedMessage({ ruleId: "rule", range: [1, 10], ignoringRuleId: "*" }),
                createIgnoreReportedMessage({ ruleId: "rule", range: [20, 30], ignoringRuleId: "*" })
            ];
            assert.equal(filterMessages(messages).length, 2);
        });
        it("should not includes ignore message in the result", function () {
            const messages = [
                createTextlintMessage(MULTILINE_TEXT, {
                    ruleId: "rule",
                    message: "message",
                    range: [10, 15]
                }),
                createIgnoreReportedMessage({ ruleId: "rule", range: [1, 100], ignoringRuleId: "*" }),
                createIgnoreReportedMessage({ ruleId: "rule", range: [0, 200], ignoringRuleId: "*" })
            ];
            assert.equal(filterMessages(messages).length, 0);
        });
    });
    context("when the message has ignoringRuleId", function () {
        it("* match any rule", function () {
            const messages = [
                createTextlintMessage(MULTILINE_TEXT, {
                    ruleId: "rule-a",
                    message: "message a",
                    range: [10, 11]
                }),
                createTextlintMessage(MULTILINE_TEXT, {
                    ruleId: "rule-b",
                    message: "message b",
                    range: [10, 11]
                }),
                createTextlintMessage(MULTILINE_TEXT, {
                    ruleId: "rule-b",
                    message: "message",
                    range: [20, 21]
                }),
                createIgnoreReportedMessage({ ruleId: "ignore-rule", range: [1, 100], ignoringRuleId: "*" })
            ]; // filter all rule
            assert.equal(filterMessages(messages).length, 0);
        });
        it("should only filter messages that are matched the ruleId", function () {
            const messages = [
                createTextlintMessage(MULTILINE_TEXT, {
                    ruleId: "rule-a",
                    message: "message a",
                    range: [10, 11]
                }),
                createTextlintMessage(MULTILINE_TEXT, {
                    ruleId: "rule-b",
                    message: "message b",
                    range: [10, 11]
                }),
                createTextlintMessage(MULTILINE_TEXT, {
                    ruleId: "rule-b",
                    message: "message",
                    range: [20, 21]
                }),
                createIgnoreReportedMessage({ ruleId: "ignore-rule", range: [1, 100], ignoringRuleId: "rule-b" })
            ]; // filter only "rule-b"
            assert.equal(filterMessages(messages).length, 1);
            assert.equal(filterMessages(messages)[0].ruleId, "rule-a");
        });
    });
});
