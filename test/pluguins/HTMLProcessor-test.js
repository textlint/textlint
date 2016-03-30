// LICENSE : MIT
"use strict";
import assert from "power-assert";
import {Processor as HTMLProcessor} from "textlint-plugin-html";
import {TextLintCore} from "../../src/index";
import path from "path";
describe("HTMLPlugin", function () {
    let textlint;
    context("when target file is a HTML", function () {
        beforeEach(function () {
            textlint = new TextLintCore();
            textlint.setupProcessors({
                html: HTMLProcessor
            });
            textlint.setupRules({
                "example-rule": require("../fixtures/rules/example-rule")
            });
        });
        it("should have default + additional processors", function () {
            assert(textlint.processors.length === 3);
        });
        it("should ignore duplicated processor", function () {
            textlint.setupProcessors({
                html: HTMLProcessor
            });
            textlint.setupProcessors({
                html: HTMLProcessor
            });
            assert(textlint.processors.length === 3);
        });
        it("should report error", function () {
            var fixturePath = path.join(__dirname, "/../fixtures/test.html");
            return textlint.lintFile(fixturePath).then(results => {
                assert(results.messages.length > 0);
                assert(results.filePath === fixturePath);
            });
        });
    });
});
