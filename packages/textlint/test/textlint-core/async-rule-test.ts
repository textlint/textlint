// LICENSE : MIT
"use strict";
const path = require("path");
const assert = require("assert");
import { TextLintEngine, TextLintCore } from "../../src";

const { coreFlags, resetFlags } = require("@textlint/feature-flag");
import { TextlintRuleCreator } from "@textlint/kernel";
// fixture
import fixtureRule from "./fixtures/rules/example-rule";
import fixtureRuleAsync from "./fixtures/rules/async-rule";

describe("Async", function() {
    beforeEach(() => {
        coreFlags.experimental = true;
    });
    afterEach(() => {
        resetFlags();
    });
    it("should support async", function() {
        const textlint = new TextLintCore();
        textlint.setupRules({
            "rule-name": function(context) {
                const { Syntax, report, RuleError } = context;

                return {
                    [Syntax.Str](node) {
                        return new Promise(resolve => {
                            setTimeout(() => {
                                report(node, new RuleError("before"));
                                resolve();
                            }, 100);
                        });
                    },
                    [Syntax.Str + ":exit"](node) {
                        report(node, new RuleError("after"));
                    }
                };
            } as TextlintRuleCreator
        });
        return textlint.lintMarkdown("string").then(result => {
            assert(result.filePath === "<markdown>");
            assert(result.messages.length === 2);
        });
    });
    it("should promise each messages", function() {
        const textlint = new TextLintCore();
        // each rule throw 1 error.
        textlint.setupRules({
            "example-rule": fixtureRule,
            "async-rule": fixtureRuleAsync,
            "example2-rule": fixtureRule,
            "example3-rule": fixtureRule,
            "async2-rule": fixtureRuleAsync
        });
        return textlint.lintMarkdown("string").then(result => {
            // filtered duplicated messages => 2 patterns
            assert(result.messages.length === 2);
        });
    });
    it("should promise each messages on multiple files", function() {
        const rules = ["async-rule", "example-rule"];
        const engine = new TextLintEngine({
            rulesBaseDirectory: path.join(__dirname, "fixtures", "rules"),
            rules: rules
        });
        const targetFile1 = path.join(__dirname, "fixtures", "test.md");
        const targetFile2 = path.join(__dirname, "fixtures", "test2.md");
        const files = [targetFile1, targetFile2];
        return engine.executeOnFiles(files).then(results => {
            assert.equal(results.length, files.length);
            results.forEach(result => {
                assert.equal(result.messages.length, rules.length);
            });
        });
    });
});
