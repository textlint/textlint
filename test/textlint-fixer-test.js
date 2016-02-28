// LICENSE : MIT
"use strict";
import assert from "power-assert";
import TextLintCore from "../src/textlint-core";
import ruleAdd from "./fixtures/fixer-rules/fixer-rule-add";
import ruleReplace from "./fixtures/fixer-rules/fixer-rule-replace";
describe("textlint-fixer", function () {
    context("when use fixer-rule-add", function () {
        it("should return text added and replaced", function () {
            var textlint = new TextLintCore();
            textlint.setupRules({
                "fixer-rule-add": ruleAdd,
                "fixer-rule-replace": ruleReplace
            });
            return textlint.fixText("This is fix", ".md").then(result => {
                assert(typeof result.text === "string");
                assert.equal(result.text, "This is fixed.");
            });
        });
    });
});