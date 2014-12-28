// LICENSE : MIT
"use strict";
var assert = require("power-assert");
var normalize = require("../lib/parse/markdown/markdown-normalizer");
describe("markdown-normalizer-test", function () {
    context("when pure markdown", function () {
        it("should return same string", function () {
            var markdown = "header \n" +
                "-----";
            assert.equal(normalize(markdown), markdown);
        });
    });
    context("when markdown with yaml header", function () {
        it("should replace br yaml header form markdown", function () {
            var markdown = "---\n" +
                "title: title\n" +
                "---\n" +
                "test";
            var result = normalize(markdown);
            assert.equal(result, "\n" +
            "\n" +
            "\n" +
            "test");
        });
    });
});