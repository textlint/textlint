// LICENSE : MIT
"use strict";
import assert from "power-assert";
import noTodo from "./fixtures/no-todo";
import {textlint} from "../../src/index";
describe("no-todo-rule-test", function () {
    beforeEach(function () {
        textlint.setupRules({
            "no-todo": noTodo
        });
    });
    afterEach(function () {
        textlint.resetRules();
    });
    context("when \"todo:\" is come", function () {
        it("should report error", function () {
            return textlint.lintMarkdown("TODO: something").then(result => {
                assert(result.messages.length === 1);
                // TextLintMessage
                var message = result.messages[0];
                assert.equal(message.line, 1); // 1-based
                assert.equal(message.column, 1);// 1-based
                assert.equal(message.message, "Found TODO: 'TODO: something'");
            });
        });
        it("should report error", function () {
            return textlint.lintMarkdown("123456789TODO: something").then(result => {
                assert(result.messages.length === 1);
                // TextLintMessage
                var message = result.messages[0];
                assert.equal(message.line, 1); // 1-based
                assert.equal(message.column, 10);// 1-based
                assert.equal(message.message, "Found TODO: '123456789TODO: something'");
            });
        });
    });
    context("when \"- [ ] something\" is come", function () {
        it("should report error", function () {
            return textlint.lintMarkdown("- [ ] something").then(result => {
                assert(result.messages.length === 1);
            });
        });
    });
    context("when \"- [link][] something\" is come", function () {
        it("should not report error", function () {
            return textlint.lintMarkdown("- [link][] ").then(result => {
                assert(result.messages.length === 0);
            });
        });
    });
    context("when \"[todo:](http://example.com)\" is come", function () {
        it("should not report error", function () {
            return textlint.lintMarkdown("[todo:](http://example.com)").then(result => {
                assert(result.messages.length === 0);
            });
        });
    });
});
