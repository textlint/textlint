// LICENSE : MIT
"use strict";
import assert from "power-assert";
import TextLintCore from "../src/textlint-core";
import ruleAdd from "./fixtures/fixer-rules/fixer-rule-add";
import ruleReplace from "./fixtures/fixer-rules/fixer-rule-replace";
describe("textlint-fixer", function () {
    context("#fixText", function () {
        it("should return text added and replaced", function () {
            var textlint = new TextLintCore();
            textlint.setupRules({
                "fixer-rule-add": ruleAdd,
                "fixer-rule-replace": ruleReplace
            });
            return textlint.fixText("This is fix", ".md").then(result => {
                assert(typeof result.output === "string");
                assert(result.filePath === "<markdown>");
                assert.equal(result.applyingMessages.length, 2);
                assert.equal(result.remainingMessages.length, 0);
                assert.equal(result.output, "This is fixed.");
            });
        });
    });
    context("#fixFile", function () {
        it("should return text added and replaced", function () {
            var textlint = new TextLintCore();
            textlint.setupRules({
                "fixer-rule-add": ruleAdd,
                "fixer-rule-replace": ruleReplace
            });
            var filePath = __dirname + "/fixtures/fixer-rules/fix.md";
            return textlint.fixFile(filePath).then(result => {
                assert(typeof result.output === "string");
                assert(result.filePath === filePath);
                assert.equal(result.applyingMessages.length, 2);
                assert.equal(result.remainingMessages.length, 0);
                assert.equal(result.output, "This is fixed.");
            });
        });

    });
});