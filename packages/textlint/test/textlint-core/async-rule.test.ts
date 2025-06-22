// LICENSE : MIT
"use strict";
import assert from "node:assert";
import { afterEach, beforeEach, describe, it } from "vitest";
import { TextlintRuleModule } from "@textlint/kernel";
import { coreFlags, resetFlags } from "@textlint/feature-flag";
// fixture
import fixtureRule from "./fixtures/rules/example-rule.js";

import fixtureRuleAsync from "./fixtures/rules/async-rule.js";
import { TextLintCore } from "@textlint/legacy-textlint-core";

describe("Async Rule", function () {
    beforeEach(() => {
        coreFlags.experimental = true;
    });
    afterEach(() => {
        resetFlags();
    });
    it("should support async", function () {
        const textlint = new TextLintCore();
        textlint.setupRules({
            "rule-name": function (context) {
                const { Syntax, report, RuleError } = context;

                return {
                    [Syntax.Str](node) {
                        return new Promise<void>((resolve) => {
                            setTimeout(() => {
                                report(node, new RuleError("before"));
                                resolve();
                            }, 100);
                        });
                    },
                    [Syntax.StrExit](node) {
                        report(node, new RuleError("after"));
                    }
                };
            } as TextlintRuleModule
        });
        return textlint.lintMarkdown("string").then((result) => {
            assert.ok(result.filePath === "<markdown>");
            assert.ok(result.messages.length === 2);
        });
    });
    it("should promise each messages", function () {
        const textlint = new TextLintCore();
        // each rule throw 1 error.
        textlint.setupRules({
            "example-rule": fixtureRule,
            "async-rule": fixtureRuleAsync,
            "example2-rule": fixtureRule,
            "example3-rule": fixtureRule,
            "async2-rule": fixtureRuleAsync
        });
        return textlint.lintMarkdown("string").then((result) => {
            // filtered duplicated messages => 2 patterns
            assert.ok(result.messages.length === 2);
        });
    });
});
