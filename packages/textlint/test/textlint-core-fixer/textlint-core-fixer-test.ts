// LICENSE : MIT
"use strict";
import assert from "assert";
import path from "path";
import * as fs from "fs";
import { TextLintCore } from "../../src/textlint-core";
import ruleAdd from "./fixtures/fixer-rules/fixer-rule-add";
import ruleReplace from "./fixtures/fixer-rules/fixer-rule-replace";
import ruleRemove from "./fixtures/fixer-rules/fixer-rule-remove";
const inputFilePath = path.join(__dirname, "/fixtures/fixer-rules/input.md");
const outputFilePath = path.join(__dirname, "/fixtures/fixer-rules/output.md");

describe("textlint-fixer", function () {
    let textlint: TextLintCore;

    context("#fixText", function () {
        it("should return text added and replaced", function () {
            textlint = new TextLintCore();
            textlint.setupRules({ "fixer-rule-add": ruleAdd, "fixer-rule-replace": ruleReplace });
            return textlint.fixText("This is fix", ".md").then((result) => {
                assert.ok(typeof result.output === "string");
                assert.ok(result.filePath === "<markdown>");
                assert.equal(result.messages.length, result.applyingMessages.length + result.remainingMessages.length);
                assert.equal(result.applyingMessages.length, 2);
                assert.equal(result.remainingMessages.length, 0);
                assert.equal(result.output, "This is fixed.");
            });
        });
    });
    context("#fixFile", function () {
        it("should return text added and replaced", function () {
            textlint = new TextLintCore();
            const rules = {
                "fixer-rule-remove": ruleRemove,
                "fixer-rule-replace": ruleReplace,
                "fixer-rule-add": ruleAdd
            };
            textlint.setupRules(rules);
            const expectedOutput = fs.readFileSync(outputFilePath, "utf-8");
            return textlint.fixFile(inputFilePath).then((result) => {
                assert.ok(typeof result.output === "string");
                assert.ok(result.filePath === inputFilePath);
                assert.equal(result.messages.length, result.applyingMessages.length + result.remainingMessages.length);
                assert.equal(result.applyingMessages.length, Object.keys(rules).length);
                assert.equal(result.remainingMessages.length, 0);
                assert.equal(result.output, expectedOutput);
            });
        });
    });
});
