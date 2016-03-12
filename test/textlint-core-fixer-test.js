// LICENSE : MIT
"use strict";
import assert from "power-assert";
import TextLintCore from "../src/textlint-core";
import ruleAdd from "./fixtures/fixer-rules/fixer-rule-add";
import ruleReplace from "./fixtures/fixer-rules/fixer-rule-replace";
import ruleRemove from "./fixtures/fixer-rules/fixer-rule-remove";
import fs from "fs";
import {parse} from "markdown-to-ast";
import SourceCodeFixer from "../src/fixer/source-code-fixer";
import SourceCode from "../src/core/source-code";
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
            const textlint = new TextLintCore();
            const rules = {
                "fixer-rule-remove": ruleRemove,
                "fixer-rule-replace": ruleReplace,
                "fixer-rule-add": ruleAdd
            };
            textlint.setupRules(rules);
            const inputFilePath = __dirname + "/fixtures/fixer-rules/input.md";
            const expectedOutput = fs.readFileSync(__dirname + "/fixtures/fixer-rules/output.md", "utf-8");
            return textlint.fixFile(inputFilePath).then(result => {
                assert(typeof result.output === "string");
                assert(result.filePath === inputFilePath);
                assert.equal(result.applyingMessages.length, Object.keys(rules).length);
                assert.equal(result.remainingMessages.length, 0);
                assert.equal(result.output, expectedOutput);
            });
        });
    });
    context("reproduce from applyingMessages", function () {
        it("should return text added and replaced", function () {
            const textlint = new TextLintCore();
            textlint.setupRules({
                "fixer-rule-add": ruleAdd,
                "fixer-rule-replace": ruleReplace,
                "fixer-rule-remove": ruleRemove
            });
            const inputFilePath = __dirname + "/fixtures/fixer-rules/input.md";
            const text = fs.readFileSync(inputFilePath, "utf-8");
            const sourceCode = new SourceCode({
                text,
                ast: parse(text),
                ext: ".md",
                filePath: inputFilePath
            });
            return textlint.fixFile(inputFilePath).then(result => {
                const reResult = SourceCodeFixer.sequentiallyApplyFixes(sourceCode, result.originalMessages);
                assert(reResult.fixed);
                assert.equal(reResult, result.output);
            });
        });
    });
});
