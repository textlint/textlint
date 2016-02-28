// LICENSE : MIT
"use strict";
import assert from "power-assert";
import TextLintCore from "../src/textlint-core";
import ruleAdd from "./fixtures/fixer-rules/fixer-rule-add";
import ruleReplace from "./fixtures/fixer-rules/fixer-rule-replace";
describe("textlint-fixer", function () {
    context("when use fixer-rule-add", function () {
        it("should return text added", function () {
            var textlint = new TextLintCore();
            textlint.setupRules({
                "fixer-rule-add": ruleAdd,
                "fixer-rule-replace": ruleReplace
            });
            return textlint.fixText("This is fix", ".md").then(result => {
                assert.equal(result, "This is fixed.");
            });
        });
    });
});