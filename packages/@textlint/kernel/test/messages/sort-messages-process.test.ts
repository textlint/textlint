// LICENSE : MIT
"use strict";
import * as assert from "node:assert";
import { describe, it } from "vitest";
import sortMessages from "../../src/messages/sort-messages-process.js";
import { TextlintMessage } from "@textlint/types";

const createTextlintMessage = (
    message: Partial<TextlintMessage> & { line: number; column: number }
): TextlintMessage => {
    return {
        // No Used
        ruleId: "test",
        severity: 1,
        index: 0,
        range: [0, 1],
        loc: {
            start: {
                line: 1,
                column: 0
            },
            end: {
                line: 1,
                column: 1
            }
        },
        type: "lint",
        message: "test",
        ...message
    };
};

describe("sort-message-test", function () {
    describe("when empty array", function () {
        it("should return empty array", function () {
            assert.equal(sortMessages([]).length, 0);
        });
    });
    describe("when reverse line", function () {
        it("should sort by line and column", function () {
            const message = [
                createTextlintMessage({ line: 3, column: 1 }),
                createTextlintMessage({ line: 1, column: 1 })
            ];
            const expected = [
                createTextlintMessage({ line: 1, column: 1 }),
                createTextlintMessage({ line: 3, column: 1 })
            ];
            assert.deepEqual(sortMessages(message), expected);
        });
    });
    describe("when reverse column", function () {
        it("should sort by line and column", function () {
            const message = [
                createTextlintMessage({ line: 1, column: 3 }),
                createTextlintMessage({ line: 1, column: 1 })
            ];
            const expected = [
                createTextlintMessage({ line: 1, column: 1 }),
                createTextlintMessage({ line: 1, column: 3 })
            ];
            assert.deepEqual(sortMessages(message), expected);
        });
    });
    describe("when reverse both", function () {
        it("should sort by line and column", function () {
            const message = [
                createTextlintMessage({ line: 3, column: 3 }),
                createTextlintMessage({ line: 1, column: 1 }),
                createTextlintMessage({ line: 2, column: 2 })
            ];
            const expected = [
                createTextlintMessage({ line: 1, column: 1 }),
                createTextlintMessage({ line: 2, column: 2 }),
                createTextlintMessage({ line: 3, column: 3 })
            ];
            assert.deepEqual(sortMessages(message), expected);
        });
    });
});
