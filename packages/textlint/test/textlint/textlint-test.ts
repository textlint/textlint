// LICENSE : MIT
"use strict";
import assert from "assert";
import path from "path";
import deepClone from "clone";
import { textlint } from "../../src";
import { loadFromDir } from "../../src/engine/rule-loader";

const rules = loadFromDir(path.join(__dirname, "fixtures/rules"));
// DEPRECATED: textlint api
describe("DEPRECATED: textlint-test", function () {
    beforeEach(function () {
        // This rule found `Str` Node then occur error
        textlint.setupRules(rules);
    });
    afterEach(function () {
        textlint.resetRules();
    });
    describe("lintMarkdown", function () {
        it("should found error message", function () {
            const text =
                "# TEST" +
                "\n" +
                "`potet` + **testongst**" +
                "\n" +
                "- list\n" +
                "- test\n" +
                "\n" +
                "hoge\n [a](http://example.com) fuga\n" +
                "------";
            return textlint.lintMarkdown(text).then((result) => {
                assert.ok(result.filePath === "<markdown>");
                assert.ok(result.messages.length > 0);
            });
        });
        it("should has referential transparency", function () {
            const p1 = textlint.lintMarkdown("text");
            const p2 = textlint.lintMarkdown("text");
            return Promise.all([p1, p2]).then(([r1, r2]) => {
                const result_1 = deepClone(r1);
                const result_2 = deepClone(r2);
                assert.equal(result_1.messages.length, result_2.messages.length);
            });
        });
    });
    describe("lintText", function () {
        it("should found error message", function () {
            const text = "It it plain text\n" + "\n" + "Third line.";
            return textlint.lintText(text).then((result) => {
                assert.ok(result.filePath === "<text>");
                assert.ok(result.messages.length > 0);
            });
        });
    });
    describe("lintFile", function () {
        it("filePath is loaded file path", function () {
            const filePath = path.join(__dirname, "fixtures/test.md");
            return textlint.lintFile(filePath).then((result) => {
                assert.ok(result.filePath === filePath);
            });
        });
    });
});
