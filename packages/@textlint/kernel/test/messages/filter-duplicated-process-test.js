// LICENSE : MIT
"use strict";
import filterMessages from "../../src/messages/filter-duplicated-process";
import * as assert from "assert";

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
                    range: [0, 1],
                    loc: {
                        start: {
                            line: 1,
                            column: 2
                        },
                        end: {
                            line: 1,
                            column: 3
                        }
                    },
                    severity: 2
                }
            ];
            assert.equal(filterMessages(messages).length, 1);
            assert.deepEqual(filterMessages(messages), messages);
        });
    });
    context("when contain duplicated messages", function () {
        it("should filter to be one", function () {
            const messages = [
                {
                    type: "lint",
                    ruleId: "rule",
                    message: "message",
                    index: 0,
                    line: 1,
                    column: 2,
                    range: [0, 1],
                    loc: {
                        start: {
                            line: 1,
                            column: 2
                        },
                        end: {
                            line: 1,
                            column: 3
                        }
                    },
                    severity: 2
                },
                {
                    type: "lint",
                    ruleId: "rule",
                    message: "message",
                    index: 0,
                    line: 1,
                    column: 2,
                    range: [0, 1],
                    loc: {
                        start: {
                            line: 1,
                            column: 2
                        },
                        end: {
                            line: 1,
                            column: 3
                        }
                    },
                    severity: 2
                }
            ];
            assert.equal(filterMessages(messages).length, 1);
        });
        it("should filter 3 -> 1", function () {
            const messages = [
                {
                    type: "lint",
                    ruleId: "rule",
                    message: "message",
                    index: 0,
                    line: 1,
                    column: 1,
                    range: [0, 1],
                    loc: {
                        start: {
                            line: 1,
                            column: 2
                        },
                        end: {
                            line: 1,
                            column: 3
                        }
                    },
                    severity: 2
                },
                {
                    type: "lint",
                    ruleId: "rule",
                    message: "message",
                    index: 0,
                    line: 1,
                    column: 1,
                    range: [0, 1],
                    loc: {
                        start: {
                            line: 1,
                            column: 2
                        },
                        end: {
                            line: 1,
                            column: 3
                        }
                    },
                    severity: 2
                },
                {
                    type: "lint",
                    ruleId: "rule",
                    message: "message",
                    index: 0,
                    line: 1,
                    column: 1,
                    range: [0, 1],
                    loc: {
                        start: {
                            line: 1,
                            column: 2
                        },
                        end: {
                            line: 1,
                            column: 3
                        }
                    },
                    severity: 2
                }
            ];
            assert.equal(filterMessages(messages).length, 1);
        });
    });
    context("when duplicated message, but ruleId is difference", function () {
        it("should filter messages", function () {
            const messages = [
                {
                    type: "lint",
                    ruleId: "rule-x",
                    message: "message",
                    index: 10,
                    line: 1,
                    column: 4,
                    range: [10, 11],
                    loc: {
                        start: {
                            line: 1,
                            column: 10
                        },
                        end: {
                            line: 1,
                            column: 11
                        }
                    },
                    severity: 2
                },
                {
                    type: "lint",
                    ruleId: "rule-y",
                    message: "message",
                    index: 10,
                    line: 1,
                    column: 4,
                    range: [10, 11],
                    loc: {
                        start: {
                            line: 1,
                            column: 10
                        },
                        end: {
                            line: 1,
                            column: 11
                        }
                    },
                    severity: 2
                }
            ];
            assert.equal(filterMessages(messages).length, 1);
        });
    });
    context("when duplicated message, but message is difference", function () {
        it("should not filter messages", function () {
            const messages = [
                {
                    type: "lint",
                    ruleId: "rule-x",
                    message: "x is x",
                    index: 10,
                    line: 1,
                    column: 4,
                    range: [10, 11],
                    loc: {
                        start: {
                            line: 1,
                            column: 10
                        },
                        end: {
                            line: 1,
                            column: 11
                        }
                    },
                    severity: 2
                },
                {
                    type: "lint",
                    ruleId: "rule-y",
                    message: "y is y",
                    index: 10,
                    line: 1,
                    column: 4,
                    range: [10, 11],
                    loc: {
                        start: {
                            line: 1,
                            column: 10
                        },
                        end: {
                            line: 1,
                            column: 11
                        }
                    },
                    severity: 2
                }
            ];
            assert.equal(filterMessages(messages).length, 2);
        });
    });
});
