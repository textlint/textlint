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
            textlint.addProcessor(HTMLProcessor);
            textlint.setupRules({
                "example-rule": require("../fixtures/rules/example-rule")
            });
        });
        it("should report error", function () {
            var fixturePath = path.join(__dirname, "/../fixtures/test.html");
            let results = textlint.lintFile(fixturePath);
            assert(results.messages.length > 0);
            assert(results.filePath === fixturePath);
        });
    });
});