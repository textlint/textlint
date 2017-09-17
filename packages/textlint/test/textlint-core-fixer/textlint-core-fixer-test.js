// LICENSE : MIT
"use strict";
const assert = require("power-assert");
const path = require("path");
import fs from "fs";
import TextLintCore from "../../src/textlint-core";
import ruleAdd from "./fixtures/fixer-rules/fixer-rule-add";
import ruleReplace from "./fixtures/fixer-rules/fixer-rule-replace";
import ruleRemove from "./fixtures/fixer-rules/fixer-rule-remove";
const inputFilePath = path.join(__dirname, "/fixtures/fixer-rules/input.md");
const outputFilePath = path.join(__dirname, "/fixtures/fixer-rules/output.md");

describe("textlint-fixer", function() {
    context("#fixText", function() {
        it("should return text added and replaced", function() {
            var textlint = new TextLintCore();
            textlint.setupRules({
                "fixer-rule-add": ruleAdd,
                "fixer-rule-replace": ruleReplace
            });
            return textlint.fixText("This is fix", ".md").then(result => {
                assert(typeof result.output === "string");
                assert(result.filePath === "<markdown>");
                assert.equal(result.messages.length, result.applyingMessages.length + result.remainingMessages.length);
                assert.equal(result.applyingMessages.length, 2);
                assert.equal(result.remainingMessages.length, 0);
                assert.equal(result.output, "This is fixed.");
            });
        });
    });
    context("#fixFile", function() {
        it("should return text added and replaced", function() {
            const textlint = new TextLintCore();
            const rules = {
                "fixer-rule-remove": ruleRemove,
                "fixer-rule-replace": ruleReplace,
                "fixer-rule-add": ruleAdd
            };
            textlint.setupRules(rules);
            const expectedOutput = fs.readFileSync(outputFilePath, "utf-8");
            return textlint.fixFile(inputFilePath).then(result => {
                assert(typeof result.output === "string");
                assert(result.filePath === inputFilePath);
                assert.equal(result.messages.length, result.applyingMessages.length + result.remainingMessages.length);
                assert.equal(result.applyingMessages.length, Object.keys(rules).length);
                assert.equal(result.remainingMessages.length, 0);
                assert.equal(result.output, expectedOutput);
            });
        });
    });
});
