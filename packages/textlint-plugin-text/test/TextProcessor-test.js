// LICENSE : MIT
"use strict";
import assert from "assert";
import { TextProcessor } from "../src/TextProcessor";
import { TextLintCore } from "textlint";
import path from "path";
describe("TextProcessor", function() {
    let textlint;
    beforeEach(function() {
        textlint = new TextLintCore();
        textlint.setupPlugins({
            text: TextProcessor
        });
        textlint.setupRules({
            "no-todo": require("textlint-rule-no-todo")
        });
    });
    context("when target file is a Text", function() {
        it("should report error", function() {
            const fixturePath = path.join(__dirname, "fixtures/test.txt");
            return textlint.lintFile(fixturePath).then(results => {
                assert(results.messages.length > 0);
                assert(results.filePath === fixturePath);
            });
        });
    });
    context("when target is text", function() {
        it("should report error", function() {
            return textlint.lintText("TODO: this is todo", ".txt").then(results => {
                assert(results.messages.length === 1);
                assert(results.filePath === "<text>");
            });
        });
    });
});
