// LICENSE : MIT
"use strict";
import assert from "power-assert";
import TextProcessor from "../src/TextProcessor"
import {TextLintCore} from "textlint";
import path from "path";
describe("TextProcessor", function () {
    let textlint;
    beforeEach(function () {
        textlint = new TextLintCore();
        textlint.addProcessor(TextProcessor);
        textlint.setupRules({
            "no-todo": require("textlint-rule-no-todo")
        });
    });
    context("when target file is a Text", function () {
        it("should report error", function () {
            var fixturePath = path.join(__dirname, "/test.txt");
            let results = textlint.lintFile(fixturePath);
            assert(results.messages.length > 0);
            assert(results.filePath === fixturePath);
        });
    });
    context("when target is text", function () {
        it("should report error", function () {
            let results = textlint.lintText("TODO: this is todo", ".txt");
            assert(results.messages.length === 1);
            assert(results.filePath === "<text>");
        });
    });
});