// LICENSE : MIT
"use strict";
import assert from "assert";
import TextPlugin from "../src/index";
import { TextLintCore } from "textlint";
import path from "path";

const createTextlint = (options = true) => {
    const textlint = new TextLintCore();
    textlint.setupPlugins(
        { text: TextPlugin },
        {
            text: options
        }
    );
    textlint.setupRules({ "no-todo": require("textlint-rule-no-todo").default });
    return textlint;
};

describe("TextProcessor", function() {
    context("when target file is a Text", function() {
        it("should report error", function() {
            const fixturePath = path.join(__dirname, "fixtures/test.txt");
            const textlint = createTextlint();
            return textlint.lintFile(fixturePath).then(results => {
                assert(results.messages.length > 0);
                assert(results.filePath === fixturePath);
            });
        });
    });
    context("when extensions option is specified", function() {
        it("should report error", function() {
            const fixturePath = path.join(__dirname, "fixtures/test.custom");
            const textlint = createTextlint({
                extensions: [".custom"]
            });
            return textlint.lintFile(fixturePath).then(results => {
                assert(results.messages.length > 0);
                assert(results.filePath === fixturePath);
            });
        });
    });
    context("when target is text", function() {
        it("should report error", function() {
            const textlint = createTextlint();
            return textlint.lintText("TODO: this is todo", ".txt").then(results => {
                assert(results.messages.length === 1);
                assert(results.filePath === "<text>");
            });
        });
    });
});
