// LICENSE : MIT
"use strict";
import assert from "power-assert";
import MarkdownPlugin from "../src/index";
import { TextLintCore } from "textlint";
import path from "path";

const createTextlint = (options = true) => {
    const textlint = new TextLintCore();
    textlint.setupPlugins(
        { markdown: MarkdownPlugin },
        {
            markdown: options
        }
    );
    textlint.setupRules({ "no-todo": require("textlint-rule-no-todo") });
    return textlint;
};
describe("MarkdownPlugin", function() {
    context("when target file is a HTML", function() {
        it("should report error", function() {
            const fixturePath = path.join(__dirname, "/error.md");
            const textlint = createTextlint();
            return textlint.lintFile(fixturePath).then(results => {
                assert(results.messages.length > 0);
                assert(results.filePath === fixturePath);
            });
        });
    });
    context("extensions", function() {
        it("should report error if extensions define .custom extension", function() {
            const fixturePath = path.join(__dirname, "/error.custom");
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
            return textlint.lintText("TODO: this is todo", ".markdown").then(results => {
                assert(results.messages.length === 1);
                assert(results.filePath === "<markdown>");
            });
        });
    });
});
