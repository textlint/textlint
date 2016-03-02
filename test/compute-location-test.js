// LICENSE : MIT
"use strict";
import assert from "power-assert";
import computeLocation from "../src/rule/compute-location";
import RuleError from "../src/rule/rule-error";

describe("compute-location", function () {
    context("column only", function () {
        it("preserve line and change coulmn", function () {
            const node = {
                type: "Str",
                range: [10, 20],
                loc: {
                    start: {
                        line: 1,
                        column: 10
                    },
                    end: {
                        line: 1,
                        column: 20
                    }
                }
            };
            const ruleError = {
                column: 5
            };
            const {line, column, fix} = computeLocation(node, ruleError);
            assert.equal(line, 1);
            assert.equal(column, 15);
            assert(!fix);
        });
    });
    context("paddingObject is plain object", function () {
        it("should accept this that same as RuleError", function () {
            const node = {
                type: "Str",
                range: [10, 20],
                loc: {
                    start: {
                        line: 1,
                        column: 10
                    },
                    end: {
                        line: 1,
                        column: 20
                    }
                }
            };
            const ruleError = {
                message: "message",
                line: 0,
                column: 5,
                fix: {
                    range: [1, 5],
                    text: "replace"
                }
            };
            const {line, column, fix} = computeLocation(node, ruleError);
            assert.equal(line, 1);
            assert.equal(column, 15);
            assert.deepEqual(fix.range, [11, 15]);
        });
    });
    context("fix", function () {
        it("range should be absolute of value", function () {
            const node = {
                type: "Str",
                range: [10, 20],
                loc: {
                    start: {
                        line: 1,
                        column: 10
                    },
                    end: {
                        line: 1,
                        column: 20
                    }
                }
            };
            const ruleError = new RuleError("message", {
                fix: {
                    range: [1, 5],
                    text: "replace"
                }
            });
            const {fix} = computeLocation(node, ruleError);
            assert.deepEqual(fix.range, [11, 15]);
        });
    });
});