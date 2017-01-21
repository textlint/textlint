// LICENSE : MIT
"use strict";
const assert = require("power-assert");
import checkMixedMessage from "../../src/shared/check-mixed-message";
describe("check-mixed-message", function () {
    context("When no mixed", function () {
        it("should not throw error ", function () {
            checkMixedMessage([
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
    });
    context("When no mixed", function () {
        it("should throw error ", function () {
            assert.throws(() => {
                checkMixedMessage([
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
                        type: "ignore",
                        ruleId: "rule",
                        message: "message",
                        index: 3,
                        line: 1,
                        column: 4,
                        severity: 2
                    }
                ]);
            });
        });
    });
});
