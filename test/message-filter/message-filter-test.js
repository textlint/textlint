// LICENSE : MIT
"use strict";
import {filterMessages} from "../../src/shared/message-filter";
const assert = require("power-assert");
describe("message-filter", function () {
    context("when pass empty messages", function () {
        it("should return empty messages", function () {
            assert.equal(filterMessages([]).length, 0);
        });
    });
    context("when only lint messages", function () {
        it("should not change messages", function () {
            const messages = [
                {
                    type: "lint",
                    ruleId: "rule",
                    message: "message",
                    index: 1,
                    line: 1,
                    column: 2,
                    severity: 2
                }
            ];
            assert.equal(filterMessages(messages).length, 1);
            assert.deepEqual(filterMessages(messages), messages);
        });
    });
    context("when contain ignore messages", function () {
        it("should not filtered, if index < ignore's range start ", function () {
            const messages = [
                {
                    type: "lint",
                    ruleId: "rule",
                    message: "message",
                    index: 0,
                    line: 1,
                    column: 2,
                    severity: 2
                },
                {
                    type: "ignore",
                    ruleId: "rule",
                    range: [1, 2]
                }
            ];
            assert.equal(filterMessages(messages).length, 1);
        });
        it("should filtered, if start <= index <= end ", function () {
            const messages = [
                {
                    type: "lint",
                    ruleId: "rule",
                    message: "message",
                    index: 0,
                    line: 1,
                    column: 1,
                    severity: 2
                },
                {
                    type: "lint",
                    ruleId: "rule",
                    message: "message",
                    index: 1,
                    line: 1,
                    column: 2,
                    severity: 2
                },
                // ignore
                {
                    type: "lint",
                    ruleId: "rule",
                    message: "message",
                    index: 2,
                    line: 1,
                    column: 3,
                    severity: 2
                },
                // ignore
                {
                    type: "lint",
                    ruleId: "rule",
                    message: "message",
                    index: 3,
                    line: 1,
                    column: 4,
                    severity: 2
                },
                {
                    type: "ignore",
                    ruleId: "rule",
                    range: [1, 2]
                }
            ];
            assert.equal(filterMessages(messages).length, 2);
            assert.deepEqual(filterMessages(messages), [
                {
                    type: "lint",
                    ruleId: "rule",
                    message: "message",
                    index: 0,
                    line: 1,
                    column: 1,
                    severity: 2
                },
                {
                    type: "lint",
                    ruleId: "rule",
                    message: "message",
                    index: 3,
                    line: 1,
                    column: 4,
                    severity: 2
                }
            ]);
        });
        it("should remove ignore message it-self", function () {
            const messages = [
                {
                    type: "lint",
                    ruleId: "rule",
                    message: "message",
                    index: 10,
                    line: 1,
                    column: 4,
                    severity: 2
                },
                {
                    type: "ignore",
                    ruleId: "rule",
                    range: [1, 100]
                },
                {
                    type: "ignore",
                    ruleId: "rule",
                    range: [0, 200]
                }
            ];
            assert.equal(filterMessages(messages).length, 0);
        });
    });
});
