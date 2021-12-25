// LICENSE : MIT
"use strict";
import * as assert from "assert";
import SourceLocation, { toAbsoluteFixCommand } from "../../src/core/source-location";
import RuleFixer from "../../src/fixer/rule-fixer";
import createDummySourceCode from "./../util/dummy-source-code";
import { coreFlags, resetFlags } from "@textlint/feature-flag";
import { TextlintRuleErrorImpl } from "../../src/context/TextlintRuleErrorImpl";
import { TxtNode } from "@textlint/ast-node-types";

const sourceCode = createDummySourceCode();
describe("source-location", function () {
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
                range: [10, 20] as [number, number],
                raw: "1234567890",
                loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } }
            };
            const ruleError = new TextlintRuleErrorImpl("message");
            const { line, column } = sourceLocation.adjust({ ruleId: "test", node, ruleError });
            assert.strictEqual(line, 1);
            assert.strictEqual(column, 10);
        });
    });
    context("column only", function () {
        it("[Backward Compatible] should handle column as index", function () {
            coreFlags.runningTester = false;
            const sourceLocation = new SourceLocation(sourceCode);
            const node = {
                type: "String",
                range: [10, 20] as [number, number],
                raw: "1234567890",
                loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } }
            };
            const ruleError = {
                // == index
                column: 5,
                message: "error message"
            };
            const { line, column } = sourceLocation.adjust({ ruleId: "test", node, ruleError });
            assert.strictEqual(line, 1);
            assert.strictEqual(column, 15);
        });
        context("[textlint-tester] when testing", function () {
            it("should throw error in testing.", function () {
                const sourceLocation = new SourceLocation(sourceCode);
                const node = {
                    type: "String",
                    range: [10, 20] as [number, number],
                    raw: "1234567890",
                    loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } }
                };
                const ruleError = { column: 5, message: "error message" };
                assert.throws(() => {
                    sourceLocation.adjust({ ruleId: "test", node, ruleError });
                });
            });
        });
    });
    context("index only", function () {
        it("should return column, line", function () {
            const sourceLocation = new SourceLocation(sourceCode);
            const node = {
                type: "String",
                range: [10, 20] as [number, number],
                raw: "1234567890",
                loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } }
            };
            const ruleError = { index: 5, message: "error message" };
            const { line, column } = sourceLocation.adjust({ ruleId: "test", node, ruleError });
            assert.strictEqual(line, 1);
            assert.strictEqual(column, 15);
        });
    });

    context("index and column", function () {
        it("should throw error", function () {
            const sourceLocation = new SourceLocation(sourceCode);
            const node = {
                type: "String",
                range: [10, 20] as [number, number],
                raw: "1234567890",
                loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } }
            };
            const ruleError = { column: 5, index: 5, message: "error message" };
            //
            assert.throws(() => {
                sourceLocation.adjust({ ruleId: "test", node, ruleError });
            });
        });
        it("should throw error with RuleName", function () {
            const sourceLocation = new SourceLocation(sourceCode);
            const node = {
                type: "String",
                range: [10, 20] as [number, number],
                raw: "1234567890",
                loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } }
            };
            const ruleError = { column: 5, index: 5, message: "error message" };
            // ruleId is passed, should error message contain the ruleId
            assert.throws(() => {
                sourceLocation.adjust({ ruleId: "RULE_NAME", node, ruleError });
            }, /\[RULE_NAME\]/);
        });
    });
    context("when line only", function () {
        it("should add line to the node.start", function () {
            const source = createDummySourceCode("1234567890\n\n1234567890\n", "test.md");
            const sourceLocation = new SourceLocation(source);
            const node = source.ast.children[0].children[0];
            const ruleError = { line: 1, message: "error message" };
            const { line, column } = sourceLocation.adjust({ ruleId: "test", node, ruleError });
            assert.strictEqual(line, 2);
            assert.strictEqual(column, 0);
        });
    });

    context("paddingObject is plain object", function () {
        it("should accept this that same as RuleError", function () {
            const sourceLocation = new SourceLocation(sourceCode);
            const node = {
                type: "String",
                range: [10, 20] as [number, number],
                raw: "1234567890",
                loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } }
            };
            const ruleError = {
                message: "message",
                line: 0,
                column: 5,
                fix: { isAbsolute: false, range: [1, 5] as [number, number], text: "replace" }
            };
            const { line, column } = sourceLocation.adjust({ ruleId: "test", node, ruleError });
            assert.strictEqual(line, 1);
            assert.strictEqual(column, 15);
        });
        it("fix should accept this that same as RuleError", function () {
            const node = {
                type: "String",
                range: [10, 20] as [number, number],
                raw: "1234567890",
                loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } }
            };
            const ruleError = {
                message: "message",
                line: 0,
                column: 5,
                fix: { isAbsolute: false, range: [1, 5] as [number, number], text: "replace" }
            };
            const { fix } = toAbsoluteFixCommand({ node, ruleError });
            assert.deepStrictEqual(fix?.range, [11, 15]);
        });
    });
    describe("toAbsoluteFixCommand", function () {
        it("should return {line, column, fix}", function () {
            const node = {
                type: "String",
                range: [10, 20] as [number, number],
                raw: "1234567890",
                loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } }
            };
            const fixer = new RuleFixer();
            const ruleError = new TextlintRuleErrorImpl("message", {
                line: 1,
                column: 1,
                fix: fixer.replaceTextRange([1, 5], "replace")
            });
            const { fix } = toAbsoluteFixCommand({ node, ruleError });
            assert.deepStrictEqual(fix?.range, [11, 15]);
        });
        it("range should be absolute of value", function () {
            const node = {
                type: "String",
                range: [10, 20] as [number, number],
                raw: "1234567890",
                loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } }
            };
            const ruleError = new TextlintRuleErrorImpl("message", {
                fix: {
                    isAbsolute: false,
                    range: [1, 5],
                    text: "replace"
                }
            });
            const { fix } = toAbsoluteFixCommand({ node, ruleError });
            assert.deepStrictEqual(fix?.range, [11, 15]);
        });
        it("is not adjust fix command range - because it is absolute position", function () {
            const node = {
                type: "Str",
                range: [10, 20] as [number, number],
                raw: "dummy",
                loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } }
            };
            const fixer = new RuleFixer();
            const ruleError = new TextlintRuleErrorImpl("message", {
                fix: fixer.insertTextAfter(node, ".")
            });
            const { fix } = toAbsoluteFixCommand({ node, ruleError });
            assert.deepStrictEqual(fix?.range, [20, 20]);
            assert.deepStrictEqual(fix?.text, ".");
        });
        it("is not adjust fix command range - because it is absolute position", function () {
            const node: TxtNode = {
                type: "Str",
                range: [10, 20],
                raw: "dummy",
                loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } }
            };
            const fixer = new RuleFixer();
            const ruleError = new TextlintRuleErrorImpl("message", { fix: fixer.remove(node) });
            const { fix } = toAbsoluteFixCommand({ node, ruleError });
            assert.deepStrictEqual(fix?.range, [10, 20]);
            assert.deepStrictEqual(fix?.text, "");
        });
    });
});
