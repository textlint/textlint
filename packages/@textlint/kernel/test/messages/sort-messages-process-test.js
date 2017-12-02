// LICENSE : MIT
"use strict";
import * as assert from "assert";
import sortMessages from "../../src/messages/sort-messages-process";
describe("sort-message-test", function() {
    context("when empty array", function() {
        it("should return empty array", function() {
            assert.equal(sortMessages([]).length, 0);
        });
    });
    context("when reverse line", function() {
        it("should sort by line and column", function() {
            const message = [{ line: 3, column: 1 }, { line: 1, column: 1 }];
            const expected = [{ line: 1, column: 1 }, { line: 3, column: 1 }];
            assert.deepEqual(sortMessages(message), expected);
        });
    });
    context("when reverse column", function() {
        it("should sort by line and column", function() {
            const message = [{ line: 1, column: 3 }, { line: 1, column: 1 }];
            const expected = [{ line: 1, column: 1 }, { line: 1, column: 3 }];
            assert.deepEqual(sortMessages(message), expected);
        });
    });
    context("when reverse both", function() {
        it("should sort by line and column", function() {
            const message = [{ line: 3, column: 3 }, { line: 1, column: 1 }, { line: 2, column: 2 }];
            const expected = [{ line: 1, column: 1 }, { line: 2, column: 2 }, { line: 3, column: 3 }];
            assert.deepEqual(sortMessages(message), expected);
        });
    });
});
