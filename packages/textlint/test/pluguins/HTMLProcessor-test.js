// LICENSE : MIT
"use strict";
import assert from "power-assert";
import htmlPlugin from "textlint-plugin-html";
import { TextLintCore } from "../../src/index";
import path from "path";

describe("HTMLPlugin", function() {
    let textlintCore;
    context("deprecated API", () => {
        it("setupRules can add processor", () => {
            textlintCore = new TextLintCore();
            textlintCore.setupPlugins({
                html: htmlPlugin.Processor
            });
            textlintCore.setupRules({
                "example-rule": require("./fixtures/example-rule")
            });
            const fixturePath = path.join(__dirname, "./fixtures/test.html");
            return textlintCore.lintFile(fixturePath).then(results => {
                assert(results.messages.length > 0);
                assert(results.filePath === fixturePath);
            });
        });
    });
    context("when target file is a HTML", function() {
        beforeEach(function() {
            textlintCore = new TextLintCore();
            textlintCore.setupPlugins({
                html: htmlPlugin
            });
            textlintCore.setupRules({
                "example-rule": require("./fixtures/example-rule")
            });
        });
        it("should have default + additional processors", function() {
            const availableExtensions = textlintCore.pluginCreatorSet.plugins;
            assert(availableExtensions.length === 3);
        });
        it("should ignore duplicated processor", function() {
            textlintCore.setupPlugins({
                html: htmlPlugin
            });
            textlintCore.setupPlugins({
                html: htmlPlugin
            });
            const availableExtensions = textlintCore.pluginCreatorSet.plugins;
            assert(availableExtensions.length === 3);
        });
        it("should report error", function() {
            const fixturePath = path.join(__dirname, "./fixtures/test.html");
            return textlintCore.lintFile(fixturePath).then(results => {
                assert(results.messages.length > 0);
                assert(results.filePath === fixturePath);
            });
        });
    });
});
