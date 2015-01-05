// LICENSE : MIT
"use strict";
var assert = require("power-assert");
var deepClone = require("clone");
var textLint = require("../").textlint;
var loadRules = require("../lib/rule/load-rules");
var rules = loadRules(__dirname + "/fixtures/rules");
describe("textlint-test", function () {
    beforeEach(function () {
        // This rule found `Str` Node then occur error
        textLint.setupRules(rules);
    });
    afterEach(function () {
        textLint.resetRules();
    });
    describe("lintMarkdown", function () {
        it("should found error message", function () {
            var result = textLint.lintMarkdown("# TEST" +
            "\n" +
            "`potet` + **testongst**" +
            "\n" +
            "- list\n" +
            "- test\n" +
            "\n" +
            "hoge\n [a](http://example.com) fuga\n" +
            "------");
            assert(result.filePath === "<markdown>");
            assert(result.messages.length > 0);
        });
        it("should has referential transparency", function () {
            var result_1 = deepClone(textLint.lintMarkdown("text"));
            var result_2 = deepClone(textLint.lintMarkdown("text"));
            assert.equal(result_1.messages.length, result_2.messages.length);
        });
    });
    describe("lintText", function () {
        it("should found error message", function () {
            var result = textLint.lintText("It it plain text\n" +
            "\n" +
            "Third line.");
            assert(result.filePath === "<text>");
            assert(result.messages.length > 0);
        });
        it("should has referential transparency", function () {
            var result_1 = deepClone(textLint.lintMarkdown("text"));
            var result_2 = deepClone(textLint.lintMarkdown("text"));
            assert.equal(result_1.messages.length, result_2.messages.length);
        });
    });
    describe("lintFile", function () {
        it("filePath is loaded file path", function () {
            var filePath = require("path").join(__dirname, "fixtures/test.md");
            var result = textLint.lintFile(filePath);
            assert(result.filePath === filePath);
        });
    });
});