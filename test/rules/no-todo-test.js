// LICENSE : MIT
"use strict";
var assert = require("power-assert");
var textlint = require("../../").textlint;
describe("no-todo-test", function () {
    beforeEach(function () {
        textlint.setupRules({
            "no-todo": require("../../rules/no-todo")
        });
    });
    afterEach(function () {
        textlint.resetRules();
    });
    context('when "todo:" is come', function () {
        it("should report error", function () {
            var result = textlint.lintMarkdown("TODO: something");
            assert(result.messages.length === 1);
        });
    });
    context('when "- [] something" is come', function () {
        it("should report error", function () {
            var result = textlint.lintMarkdown("- [] something");
            assert(result.messages.length === 1);
        });
    });
    context('when "[todo:](http://example.com)" is come', function () {
        it("should not report error", function () {
            var result = textlint.lintMarkdown("[todo:](http://example.com)");
            assert(result.messages.length === 0);
        });
    });
});