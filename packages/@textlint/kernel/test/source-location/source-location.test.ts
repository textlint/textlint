// LICENSE : MIT
"use strict";
import * as assert from "node:assert";
import { afterEach, beforeEach, describe, it } from "vitest";
import { resolveFixCommandLocation, resolveLocation } from "../../src/core/source-location.js";
import RuleFixer from "../../src/fixer/rule-fixer.js";
import createDummySourceCode from "../util/dummy-source-code.js";
import { coreFlags, resetFlags } from "@textlint/feature-flag";
import { TextlintRuleErrorImpl } from "../../src/context/TextlintRuleErrorImpl.js";
import { TxtNode } from "@textlint/ast-node-types";
import { createPaddingLocator } from "../../src/context/TextlintRulePaddingLocator.js";
import { TextlintRuleError } from "@textlint/types";

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
    describe("message only", function () {
        it("should return node's start location", function () {
            const node = {
                type: "Str" as const,
                range: [10, 20] as const,
                raw: "1234567890",
                loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } }
            };
            const ruleError = new TextlintRuleErrorImpl("message");
            const result = resolveLocation({ source, ruleId: "test", node, ruleError });
            const { line, column } = result.loc.start;
            assert.strictEqual(line, 1);
            assert.strictEqual(column, 11);
        });
    });
    describe("[deprecated] column only", function () {
        it("[Backward Compatible] should handle column as index", function () {
            coreFlags.runningTester = false;

            const node = {
                type: "Str" as const,
                range: [10, 20] as const,
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
            assert.strictEqual(column, 16);
        });
        describe("[textlint-tester] when testing", function () {
            it("should throw error in testing.", function () {
                const node = {
                    type: "Str" as const,
                    range: [10, 20] as const,
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
    describe("[deprecated] index only", function () {
        it("should return column, line", function () {
            const node = {
                type: "Str" as const,
                range: [10, 20] as const,
                raw: "1234567890",
                loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } }
            };
            const ruleError = { index: 5, message: "error message" };
            const result = resolveLocation({ source, ruleId: "test", node, ruleError });
            const { line, column } = result.loc.start;
            assert.strictEqual(line, 1);
            assert.strictEqual(column, 16);
        });
    });

    describe("[deprecated] index and column", function () {
        it("should throw error", function () {
            const node = {
                type: "Str" as const,
                range: [10, 20] as const,
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
                type: "Str" as const,
                range: [10, 20] as const,
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
    describe("[deprecated] when line only", function () {
        it("should add line to the node.start", function () {
            const source = createDummySourceCode("1234567890\n\n1234567890\n", "test.md");
            // @ts-expect-error : any node may have not children
            const node = source.ast.children[0].children[0];
            const ruleError = { line: 1, message: "error message" };
            const result = resolveLocation({ source, ruleId: "test", node, ruleError });
            assert.deepStrictEqual(result, {
                range: [11, 12],
                loc: { start: { line: 2, column: 1 }, end: { line: 3, column: 1 } }
            });
        });
    });
    describe("when pass padding property", function () {
        it("should throw error if pass invalid loc", function () {
            const source = createDummySourceCode("1234567890\n\n1234567890\n", "test.md");
            const node = source.ast;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const InvalidLocObject = [1, 2] as any;
            const ruleError = {
                padding: InvalidLocObject,
                message: "error message"
            };
            assert.throws(() => {
                resolveLocation({ source, ruleId: "test", node, ruleError });
            }, /invalid/);
        });
        it("at() should return { range, loc } object", function () {
            const source = createDummySourceCode("1234567890\n\n1234567890\n", "test.md");
            const node = source.ast;
            const ruleError: TextlintRuleError = { padding: createPaddingLocator().at(0), message: "error message" };
            const result = resolveLocation({ source, ruleId: "test", node, ruleError });
            assertDeepStrictEqualAsJSON(result, {
                range: [0, 1],
                loc: {
                    start: { line: 1, column: 1 },
                    end: { line: 1, column: 2 }
                }
            });
        });
        it("range() should return { range, loc } object", function () {
            const source = createDummySourceCode("1234567890\n\n1234567890\n", "test.md");
            const node = source.ast;
            const ruleError: TextlintRuleError = {
                padding: createPaddingLocator().range([5, 10]),
                message: "error message"
            };
            const result = resolveLocation({ source, ruleId: "test", node, ruleError });
            assertDeepStrictEqualAsJSON(result, {
                range: [5, 10],
                loc: {
                    start: { line: 1, column: 6 },
                    end: { line: 1, column: 11 }
                }
            });
        });
        it("loc() should return { range, loc } object", function () {
            const source = createDummySourceCode("1234567890\n1234567890\n1234567890", "test.md");
            const node = source.ast;
            const ruleError: TextlintRuleError = {
                padding: createPaddingLocator().loc({
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
                        column: 2,
                        line: 2
                    },
                    end: {
                        column: 3,
                        line: 3
                    }
                }
            });
            const content = source.text.slice(result.range[0], result.range[1]);
            assert.strictEqual(content, `234567890\n12`);
        });
    });
    describe("paddingObject is plain object", function () {
        it("should accept this that same as RuleError", function () {
            const node = {
                type: "Str" as const,
                range: [10, 20] as const,
                raw: "1234567890",
                loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } }
            };
            const ruleError = {
                message: "message",
                line: 0,
                column: 5,
                fix: { isAbsolute: false, range: [1, 5] as const, text: "replace" }
            };
            const result = resolveLocation({ source, ruleId: "test", node, ruleError });
            assert.deepStrictEqual(result, {
                loc: {
                    end: {
                        column: 17,
                        line: 1
                    },
                    start: {
                        column: 16,
                        line: 1
                    }
                },
                range: [15, 16]
            });
        });
        it("fix should accept this that same as RuleError", function () {
            const node = {
                type: "Str" as const,
                range: [10, 20] as const,
                raw: "1234567890",
                loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } }
            };
            const ruleError = {
                message: "message",
                line: 0,
                column: 5,
                fix: { isAbsolute: false, range: [1, 5] as const, text: "replace" }
            };
            const { fix } = resolveFixCommandLocation({ node, ruleError });
            assert.deepStrictEqual(fix?.range, [11, 15]);
        });
    });

    describe("resolveFixCommandLocation", function () {
        it("should return {fix}", function () {
            const node = {
                type: "Str" as const,
                range: [10, 20] as const,
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
                type: "Str" as const,
                range: [10, 20] as const,
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
        it("should not adjust fix command range - because it is absolute position", function () {
            const node = {
                type: "Str" as const,
                range: [10, 20] as const,
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
                type: "Str" as const,
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
