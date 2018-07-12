// LICENSE : MIT
"use strict";
import * as assert from "assert";
import { TextLintCore } from "../../src/index";
import * as path from "path";

const htmlPlugin = require("textlint-plugin-html");

describe("HTMLPlugin", function() {
    let textlintCore: TextLintCore;
    context("when target file is a HTML", function() {
        beforeEach(function() {
            textlintCore = new TextLintCore();
            textlintCore.setupPlugins({ html: htmlPlugin });
            textlintCore.setupRules({ "example-rule": require("./fixtures/example-rule") });
        });
        it("should have default + additional processors", function() {
            const descriptors = textlintCore.textlintrcDescriptor.plugin.descriptors;
            assert.strictEqual(descriptors.length, 3);
        });
        it("should ignore duplicated processor", function() {
            textlintCore.setupPlugins({ html: htmlPlugin });
            textlintCore.setupPlugins({ html: htmlPlugin });
            const descriptors = textlintCore.textlintrcDescriptor.plugin.descriptors;
            assert.strictEqual(descriptors.length, 3);
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
