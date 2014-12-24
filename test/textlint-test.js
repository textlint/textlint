// LICENSE : MIT
"use strict";
var assert = require("power-assert");
var textLint = require("../lib/textlint");
var loadRules = require("../lib/load-rules");
var rules = loadRules(__dirname + "/rules");
describe("textlint-test", function () {
    describe("lintMarkdown", function () {
        beforeEach(function () {
            textLint.setupRules(rules);
        });
        afterEach(function () {
            textLint.resetRules();
        });
        it("should return", function () {
            textLint.lintMarkdown("# TEST");
        });
    });
});