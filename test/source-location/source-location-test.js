// LICENSE : MIT
"use strict";
import assert from "power-assert";
import SourceLocation from "../../src/core/source-location";
import RuleError from "../../src/core/rule-error";
import createDummySourceCode from "./../util/dummy-source-code";
import {_logger} from "../../src";
const sourceCode = createDummySourceCode();
describe("compute-location", function () {
    beforeEach(function () {
        _logger.setRunningTest(true);
    });
    context("message only", function () {
        it("should return node's start location", function () {
            const sourceLocation = new SourceLocation(sourceCode);
            const node = {
                type: "String",
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
            const ruleError = new RuleError("message");
            const {line, column, fix} = sourceLocation.adjust({
                node,
                ruleError
            });
            assert.equal(line, 1);
            assert.equal(column, 10);
            assert(!fix);
        });
    });
    context("column only", function () {
        context("[Backward Compatible] should handle column as index", function () {
            const sourceLocation = new SourceLocation(sourceCode);
            const node = {
                type: "String",
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
                // == index
                column: 5
            };
            const {line, column, fix} = sourceLocation.adjust({
                node,
                ruleError
            });
            assert.equal(line, 1);
            assert.equal(column, 15);
            assert(!fix);
        });
        context("[textlint-tester] when testing", function () {
            it("should throw error in testing.", function () {
                const sourceLocation = new SourceLocation(sourceCode);
                const node = {
                    type: "String",
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
                    sourceLocation.adjust({
                        node,
                        ruleError
                    });
                });
            });
        });
    });
    context("index only", function () {
        it("should return column, line", function () {
            const sourceLocation = new SourceLocation(sourceCode);
            const node = {
                type: "String",
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
            const {line, column, fix} = sourceLocation.adjust({
                node,
                ruleError
            });
            assert.equal(line, 1);
            assert.equal(column, 15);
            assert(!fix);

        });
    });

    context("index and column", function () {
        it("should throw error", function () {
            const sourceLocation = new SourceLocation(sourceCode);
            const node = {
                type: "String",
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
                sourceLocation.adjust({
                    node,
                    ruleError
                });
            });
        });
        it("should throw error with RuleName", function () {
            const sourceLocation = new SourceLocation(sourceCode);
            const node = {
                type: "String",
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
            // ruleId is passed, should error message contain the ruleId
            assert.throws(() => {
                sourceLocation.adjust({
                    ruleId: "RULE_NAME",
                    node,
                    ruleError
                });
            }, /\[RULE_NAME\]/);
        });
    });
    context("line only", function () {
        it("should throw error", function () {
            const sourceLocation = new SourceLocation(sourceCode);
            const node = {
                type: "String",
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
                line: 1
            };

            const {line, column, fix} = sourceLocation.adjust({
                node,
                ruleError
            });
            assert.equal(line, 2);
            assert.equal(column, 10);
            assert(!fix);
        });
    });

    context("paddingObject is plain object", function () {
        it("should accept this that same as RuleError", function () {
            const sourceLocation = new SourceLocation(sourceCode);
            const node = {
                type: "String",
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
            const {line, column, fix} = sourceLocation.adjust({
                node,
                ruleError
            });
            assert.equal(line, 1);
            assert.equal(column, 15);
            assert.deepEqual(fix.range, [11, 15]);
        });
    });
    context("fix only", function () {
        it("range should be absolute of value", function () {
            const sourceLocation = new SourceLocation(sourceCode);
            const node = {
                type: "String",
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
            const {fix} = sourceLocation.adjust({
                node,
                ruleError
            });
            assert.deepEqual(fix.range, [11, 15]);
        });
    });
    context("full set", function () {
        it("should return {line, column, fix}", function () {
            const sourceLocation = new SourceLocation(sourceCode);
            const node = {
                type: "String",
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
                line: 1,
                column: 1,
                fix: {
                    range: [1, 5],
                    text: "replace"
                }
            });
            const {fix} = sourceLocation.adjust({
                node,
                ruleError
            });
            assert.deepEqual(fix.range, [11, 15]);
        });
    });
});
