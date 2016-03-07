// LICENSE : MIT
"use strict";
import assert from "power-assert";
import SourceLocation from "../src/rule/source-location";
import RuleError from "../src/rule/rule-error";
import createDummySourceCode from "./util/dummy-source-code";
import {_logger} from "../src";
const sourceCode = createDummySourceCode();
describe("compute-location", function () {
    beforeEach(function () {
        _logger.setRunningTest(true);
    });
    context("column only", function () {
        it("preserve line and change column", function () {
            const sourceLocation = new SourceLocation(sourceCode);
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
            assert.throws(() => {
                sourceLocation.adjust(node, ruleError);
            });
        });
    });
    context("index only", function () {
        it("should return column, line", function () {
            const sourceLocation = new SourceLocation(sourceCode);
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
                index: 5
            };
            const {line, column, fix} = sourceLocation.adjust(node, ruleError);
            assert.equal(line, 1);
            assert.equal(column, 15);
            assert(!fix);

        });
    });

    context("index and column", function () {
        it("should throw error", function () {
            const sourceLocation = new SourceLocation(sourceCode);
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
                column: 5,
                index: 5
            };
            // 
            assert.throws(() => {
                sourceLocation.adjust(node, ruleError);
            });

        });
    });
    context("paddingObject is plain object", function () {
        it("should accept this that same as RuleError", function () {
            const sourceLocation = new SourceLocation(sourceCode);
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
            const {line, column, fix} = sourceLocation.adjust(node, ruleError);
            assert.equal(line, 1);
            assert.equal(column, 15);
            assert.deepEqual(fix.range, [11, 15]);
        });
    });
    context("fix", function () {
        it("range should be absolute of value", function () {
            const sourceLocation = new SourceLocation(sourceCode);
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
            const {fix} = sourceLocation.adjust(node, ruleError);
            assert.deepEqual(fix.range, [11, 15]);
        });
    });
});