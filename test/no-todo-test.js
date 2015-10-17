// LICENSE : MIT
"use strict";
import assert from "power-assert";
import {textlint} from "../src/index";
describe("no-todo-rule-test", function () {
    beforeEach(function () {
        textlint.setupRules({
            "no-todo": require("./fixtures/rules/no-todo")
        });
    });
    afterEach(function () {
        textlint.resetRules();
    });
    context('when "todo:" is come', function () {
        it("should report error", function () {
            var result = textlint.lintMarkdown("TODO: something");
            assert(result.messages.length === 1);
            // TextLintMessage
            var message = result.messages[0];
            assert.equal(message.line, 1); // 1-based
            assert.equal(message.column, 1);// 1-based
            assert.equal(message.message, "found TODO: 'TODO: something'");
        });
        it("should report error", function () {
            var result = textlint.lintMarkdown("123456789TODO: something");
            assert(result.messages.length === 1);
            // TextLintMessage
            var message = result.messages[0];
            assert.equal(message.line, 1); // 1-based
            assert.equal(message.column, 10);// 1-based
            assert.equal(message.message, "found TODO: '123456789TODO: something'");
        });
    });
    context('when "- [ ] something" is come', function () {
        it("should report error", function () {
            var result = textlint.lintMarkdown("- [ ] something");
            assert(result.messages.length === 1);
        });
    });
    context('when "- [link][] something" is come', function () {
        it("should not report error", function () {
            var result = textlint.lintMarkdown("- [link][] ");
            assert(result.messages.length === 0);
        });
    });
    context('when "[todo:](http://example.com)" is come', function () {
        it("should not report error", function () {
            var result = textlint.lintMarkdown("[todo:](http://example.com)");
            assert(result.messages.length === 0);
        });
    });
});