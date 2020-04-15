// LICENSE : MIT
"use strict";
import * as assert from "assert";
import SourceLocation from "../../src/core/source-location";
import RuleFixer from "../../src/fixer/rule-fixer";
import createDummySourceCode from "./../util/dummy-source-code";
import { coreFlags, resetFlags } from "@textlint/feature-flag";
import { TextlintRuleErrorImpl } from "../../src/context/TextlintRuleErrorImpl";

const sourceCode = createDummySourceCode();
describe("compute-location", function () {
    beforeEach(function () {
        coreFlags.runningTester = true;
    });
    afterEach(function () {
        resetFlags();
    });
    context("message only", function () {
        it("should return node's start location", function () {
            const sourceLocation = new SourceLocation(sourceCode);
            const node = {
                type: "String",
                range: [10, 20],
                loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } }
            };
            const ruleError = new TextlintRuleErrorImpl("message");
            const { line, column, fix } = sourceLocation.adjust({ node, ruleError });
            assert.equal(line, 1);
            assert.equal(column, 10);
            assert.ok(!fix);
        });
    });
    context("column only", function () {
        context("[Backward Compatible] should handle column as index", function () {
            const sourceLocation = new SourceLocation(sourceCode);
            const node = {
                type: "String",
                range: [10, 20],
                loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } }
            };
            const ruleError = {
                // == index
                column: 5
            };
            const { line, column, fix } = sourceLocation.adjust({ node, ruleError });
            assert.equal(line, 1);
            assert.equal(column, 15);
            assert.ok(!fix);
        });
        context("[textlint-tester] when testing", function () {
            it("should throw error in testing.", function () {
                const sourceLocation = new SourceLocation(sourceCode);
                const node = {
                    type: "String",
                    range: [10, 20],
                    loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } }
                };
                const ruleError = { column: 5 };
                assert.throws(() => {
                    sourceLocation.adjust({ node, ruleError });
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
                loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } }
            };
            const ruleError = { index: 5 };
            const { line, column, fix } = sourceLocation.adjust({ node, ruleError });
            assert.equal(line, 1);
            assert.equal(column, 15);
            assert.ok(!fix);
        });
    });

    context("index and column", function () {
        it("should throw error", function () {
            const sourceLocation = new SourceLocation(sourceCode);
            const node = {
                type: "String",
                range: [10, 20],
                loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } }
            };
            const ruleError = { column: 5, index: 5 };
            //
            assert.throws(() => {
                sourceLocation.adjust({ node, ruleError });
            });
        });
        it("should throw error with RuleName", function () {
            const sourceLocation = new SourceLocation(sourceCode);
            const node = {
                type: "String",
                range: [10, 20],
                loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } }
            };
            const ruleError = { column: 5, index: 5 };
            // ruleId is passed, should error message contain the ruleId
            assert.throws(() => {
                sourceLocation.adjust({ ruleId: "RULE_NAME", node, ruleError });
            }, /\[RULE_NAME\]/);
        });
    });
    context("line only", function () {
        it("should throw error", function () {
            const sourceLocation = new SourceLocation(sourceCode);
            const node = {
                type: "String",
                range: [10, 20],
                loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } }
            };
            const ruleError = { line: 1 };

            const { line, column, fix } = sourceLocation.adjust({ node, ruleError });
            assert.equal(line, 2);
            assert.equal(column, 10);
            assert.ok(!fix);
        });
    });

    context("paddingObject is plain object", function () {
        it("should accept this that same as RuleError", function () {
            const sourceLocation = new SourceLocation(sourceCode);
            const node = {
                type: "String",
                range: [10, 20],
                loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } }
            };
            const ruleError = { message: "message", line: 0, column: 5, fix: { range: [1, 5], text: "replace" } };
            const { line, column, fix } = sourceLocation.adjust({ node, ruleError });
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
                loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } }
            };
            const ruleError = new TextlintRuleErrorImpl("message", { fix: { range: [1, 5], text: "replace" } });
            const { fix } = sourceLocation.adjust({ node, ruleError });
            assert.deepEqual(fix.range, [11, 15]);
        });
    });
    context("full set", function () {
        it("should return {line, column, fix}", function () {
            const sourceLocation = new SourceLocation(sourceCode);
            const node = {
                type: "String",
                range: [10, 20],
                loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } }
            };
            const fixer = new RuleFixer();
            const ruleError = new TextlintRuleErrorImpl("message", {
                line: 1,
                column: 1,
                fix: fixer.replaceTextRange([1, 5], "replace")
            });
            const { fix } = sourceLocation.adjust({ node, ruleError });
            assert.deepEqual(fix.range, [11, 15]);
        });
    });

    context("When fix command for node", function () {
        it("is not adjust fix command range - because it is absolute position", function () {
            const sourceLocation = new SourceLocation(sourceCode);
            const node = {
                type: "Str",
                range: [10, 20],
                raw: "dummy",
                loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } }
            };
            const fixer = new RuleFixer();
            const ruleError = new TextlintRuleErrorImpl("message", { fix: fixer.insertTextAfter(node, ".") });
            const { fix } = sourceLocation.adjust({ node, ruleError });
            assert.deepEqual(fix.range, [20, 20]);
            assert.deepEqual(fix.text, ".");
        });
        it("is not adjust fix command range - because it is absolute position", function () {
            const sourceLocation = new SourceLocation(sourceCode);
            const node = {
                type: "Str",
                range: [10, 20],
                raw: "dummy",
                loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } }
            };
            const fixer = new RuleFixer();
            const ruleError = new TextlintRuleErrorImpl("message", { fix: fixer.remove(node) });
            const { fix } = sourceLocation.adjust({ node, ruleError });
            assert.deepEqual(fix.range, [10, 20]);
            assert.deepEqual(fix.text, "");
        });
    });
});
