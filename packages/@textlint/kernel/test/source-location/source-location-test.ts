// LICENSE : MIT
"use strict";
import * as assert from "assert";
import { resolveFixCommandLocation, resolveLocation } from "../../src/core/source-location";
import RuleFixer from "../../src/fixer/rule-fixer";
import createDummySourceCode from "./../util/dummy-source-code";
import { coreFlags, resetFlags } from "@textlint/feature-flag";
import { TextlintRuleErrorImpl } from "../../src/context/TextlintRuleErrorImpl";
import { TxtNode } from "@textlint/ast-node-types";
import { createLocator } from "../../src/context/TextlintRuleLocator";

// Workaround for structured-source serialization
const assertDeepStrictEqualAsJSON = (a: unknown, b: unknown, message?: string) => {
    assert.deepStrictEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), message);
};
const source = createDummySourceCode();
describe("source-location", function () {
    beforeEach(function () {
        coreFlags.runningTester = true;
    });
    afterEach(function () {
        resetFlags();
    });
    context("message only", function () {
        it("should return node's start location", function () {
            const node = {
                type: "String",
                range: [10, 20] as [number, number],
                raw: "1234567890",
                loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } }
            };
            const ruleError = new TextlintRuleErrorImpl("message");
            const result = resolveLocation({ source, ruleId: "test", node, ruleError });
            const { line, column } = result.loc.start;
            assert.strictEqual(line, 1);
            assert.strictEqual(column, 10);
        });
    });
    context("[deprecated] column only", function () {
        it("[Backward Compatible] should handle column as index", function () {
            coreFlags.runningTester = false;

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
            const result = resolveLocation({ source, ruleId: "test", node, ruleError });
            const { line, column } = result.loc.start;
            assert.strictEqual(line, 1);
            assert.strictEqual(column, 15);
        });
        context("[textlint-tester] when testing", function () {
            it("should throw error in testing.", function () {
                const node = {
                    type: "String",
                    range: [10, 20] as [number, number],
                    raw: "1234567890",
                    loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } }
                };
                const ruleError = { column: 5, message: "error message" };
                assert.throws(() => {
                    resolveLocation({ source, ruleId: "test", node, ruleError });
                });
            });
        });
    });
    context("[deprecated] index only", function () {
        it("should return column, line", function () {
            const node = {
                type: "String",
                range: [10, 20] as [number, number],
                raw: "1234567890",
                loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } }
            };
            const ruleError = { index: 5, message: "error message" };
            const result = resolveLocation({ source, ruleId: "test", node, ruleError });
            const { line, column } = result.loc.start;
            assert.strictEqual(line, 1);
            assert.strictEqual(column, 15);
        });
    });

    context("[deprecated] index and column", function () {
        it("should throw error", function () {
            const node = {
                type: "String",
                range: [10, 20] as [number, number],
                raw: "1234567890",
                loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } }
            };
            const ruleError = { column: 5, index: 5, message: "error message" };
            //
            assert.throws(() => {
                resolveLocation({ source, ruleId: "test", node, ruleError });
            });
        });
        it("should throw error with RuleName", function () {
            const node = {
                type: "String",
                range: [10, 20] as [number, number],
                raw: "1234567890",
                loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } }
            };
            const ruleError = { column: 5, index: 5, message: "error message" };
            // ruleId is passed, should error message contain the ruleId
            assert.throws(() => {
                resolveLocation({ source, ruleId: "RULE_NAME", node, ruleError });
            }, /\[RULE_NAME\]/);
        });
    });
    context("[deprecated] when line only", function () {
        it("should add line to the node.start", function () {
            const source = createDummySourceCode("1234567890\n\n1234567890\n", "test.md");

            const node = source.ast.children[0].children[0];
            const ruleError = { line: 1, message: "error message" };
            const result = resolveLocation({ source, ruleId: "test", node, ruleError });
            const { line, column } = result.loc.start;
            assert.strictEqual(line, 2);
            assert.strictEqual(column, 0);
        });
    });
    context("when pass loc property", function () {
        it("at() should return { range, loc } object", function () {
            const source = createDummySourceCode("1234567890\n\n1234567890\n", "test.md");
            const node = source.ast;
            const ruleError = { loc: createLocator().at(0), message: "error message" };
            const result = resolveLocation({ source, ruleId: "test", node, ruleError });
            assertDeepStrictEqualAsJSON(result, {
                range: [0, 1],
                loc: {
                    start: { line: 1, column: 0 },
                    end: { line: 1, column: 1 }
                }
            });
        });
        it("range() should return { range, loc } object", function () {
            const source = createDummySourceCode("1234567890\n\n1234567890\n", "test.md");
            const node = source.ast;
            const ruleError = { loc: createLocator().range([5, 10]), message: "error message" };
            const result = resolveLocation({ source, ruleId: "test", node, ruleError });
            assertDeepStrictEqualAsJSON(result, {
                range: [5, 10],
                loc: {
                    start: { line: 1, column: 5 },
                    end: { line: 1, column: 10 }
                }
            });
        });
        it("loc() should return { range, loc } object", function () {
            const source = createDummySourceCode("1234567890\n1234567890\n1234567890", "test.md");
            const node = source.ast;
            const ruleError = {
                loc: createLocator().loc({
                    start: {
                        line: 1,
                        column: 1
                    },
                    end: {
                        line: 2,
                        column: 2
                    }
                }),
                message: "error message"
            };
            const result = resolveLocation({ source, ruleId: "test", node, ruleError });
            assertDeepStrictEqualAsJSON(result, {
                range: [12, 24],
                loc: {
                    start: {
                        column: 1,
                        line: 2
                    },
                    end: {
                        column: 2,
                        line: 3
                    }
                }
            });
            const content = source.text.slice(result.range[0], result.range[1]);
            assert.strictEqual(content, `234567890\n12`);
        });
    });
    context("paddingObject is plain object", function () {
        it("should accept this that same as RuleError", function () {
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
            const result = resolveLocation({ source, ruleId: "test", node, ruleError });
            const { line, column } = result.loc.start;
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
            const { fix } = resolveFixCommandLocation({ node, ruleError });
            assert.deepStrictEqual(fix?.range, [11, 15]);
        });
    });

    describe("resolveFixCommandLocation", function () {
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
            const { fix } = resolveFixCommandLocation({ node, ruleError });
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
            const { fix } = resolveFixCommandLocation({ node, ruleError });
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
            const { fix } = resolveFixCommandLocation({ node, ruleError });
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
            const { fix } = resolveFixCommandLocation({ node, ruleError });
            assert.deepStrictEqual(fix?.range, [10, 20]);
            assert.deepStrictEqual(fix?.text, "");
        });
    });
});
