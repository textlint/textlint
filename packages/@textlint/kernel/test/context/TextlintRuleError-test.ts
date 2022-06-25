import { TextlintRuleErrorImpl } from "../../src/context/TextlintRuleErrorImpl";
import * as assert from "assert";
import { createPaddingLocator } from "../../src/context/TextlintRulePaddingLocator";
import { coreFlags } from "@textlint/feature-flag";

describe("TextlintRuleError", function () {
    beforeEach(() => {
        coreFlags.runningTester = true;
    });
    afterEach(() => {
        coreFlags.runningTester = false;
    });
    it("allow to create rule object without details", () => {
        const rule = new TextlintRuleErrorImpl("test");
        assert.strictEqual(rule.message, "test");
        assert.strictEqual(rule.index, undefined);
        assert.strictEqual(rule.padding, undefined);
    });
    it("allow to create rule object with padding", () => {
        const locator = createPaddingLocator();
        const rule = new TextlintRuleErrorImpl("test", {
            padding: locator.range([1, 2])
        });
        assert.strictEqual(rule.message, "test");
        assert.strictEqual(rule.index, undefined);
        assert.ok(typeof rule.padding === "object");
    });
    it("should throw when passed line only ", () => {
        assert.throws(() => {
            new TextlintRuleErrorImpl("test", {
                line: 1
            });
        });
    });
    it("should throw when passed column only ", () => {
        assert.throws(() => {
            new TextlintRuleErrorImpl("test", {
                column: 1
            });
        });
    });
    it("should throw when passed index is NaN ", () => {
        assert.throws(() => {
            new TextlintRuleErrorImpl("test", {
                index: NaN
            });
        });
    });
    it("should throw when passed padding is not object ", () => {
        assert.throws(() => {
            new TextlintRuleErrorImpl("test", {
                // @ts-ignore
                padding: 1
            });
        });
    });
    it("should throw when passed wrong property ", () => {
        assert.throws(() => {
            new TextlintRuleErrorImpl("test", {
                // @ts-ignore
                at: 1
            });
        });
        assert.throws(() => {
            new TextlintRuleErrorImpl("test", {
                // @ts-ignore
                range: [1, 2]
            });
        });
        assert.throws(() => {
            new TextlintRuleErrorImpl("test", {
                // @ts-ignore
                loc: {}
            });
        });
    });
});
