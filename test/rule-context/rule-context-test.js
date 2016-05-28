// LICENSE : MIT
"use strict";
const assert = require("power-assert");
const path = require("path");
import {TextLintCore} from "../../src/index";
import {setRunningTest} from "../../src/util/throw-log";
describe("rule-context-test", function () {
    let textlint;
    beforeEach(function () {
        textlint = new TextLintCore();
    });
    context("in traverse", function () {
        var callCount;
        beforeEach(function () {
            callCount = 0;
        });
        context(":enter", function () {
            beforeEach(function () {
                textlint.setupRules({
                    // rule-key : rule function(see docs/rule.md)
                    "rule-key": function (context) {
                        var exports = {};
                        exports[context.Syntax.Str] = function (node) {
                            callCount++;
                            var parent = node.parent;
                            assert.equal(parent.type, context.Syntax.Paragraph);
                            var root = parent.parent;
                            assert.equal(root.type, context.Syntax.Document);
                        };
                        return exports;
                    }
                });
            });
            it("should call Str callback, 1+1", function () {
                return textlint.lintMarkdown("text").then(() => {
                    assert(callCount === 1);
                }).then(() => {
                    return textlint.lintText("text");
                }).then(() => {
                    assert(callCount === 2);
                });
            });
        });
        context(":exit", function () {
            beforeEach(function () {
                textlint.setupRules({
                    // rule-key : rule function(see docs/rule.md)
                    "rule-key": function (context) {
                        var exports = {};
                        exports[context.Syntax.Str + ":exit"] = function (node) {
                            callCount++;
                            var parent = node.parent;
                            assert.equal(parent.type, context.Syntax.Paragraph);
                            var root = parent.parent;
                            assert.equal(root.type, context.Syntax.Document);
                        };
                        return exports;
                    }
                });
            });
            it("should call Str callback, 1+1", function () {
                return textlint.lintMarkdown("text").then(() => {
                    assert(callCount === 1);
                }).then(() => {
                    return textlint.lintText("text");
                }).then(() => {
                    assert(callCount === 2);
                });
            });
        });
        context("when throw error in a rule", function () {
            beforeEach(function () {
                textlint.setupRules({
                    // rule-key : rule function(see docs/rule.md)
                    "throw-error-in-rule": require("./fixtures/rules/throw-error-in-rule")
                });
            });
            it("should catch error", function () {
                return textlint.lintMarkdown("text").catch(error => {
                    assert(error instanceof Error);
                });
            });
        });
        context("when throw error in a rule at file", function () {
            beforeEach(function () {
                textlint.setupRules({
                    // rule-key : rule function(see docs/rule.md)
                    "throw-error-in-rule": require("./fixtures/rules/throw-error-in-rule")
                });
            });
            it("should catch error including <file path>", function () {
                const filePath = path.join(__dirname, "fixtures/test.md");
                return textlint.lintFile(filePath).catch(error => {
                    assert(error instanceof Error);
                    assert(error.message.indexOf(filePath) !== -1);
                });
            });
        });
    });
    describe("#getSource", function () {
        it("should get text from TxtNode", function () {
            var expectedText = "this is text.";
            textlint.setupRules({
                // rule-key : rule function(see docs/rule.md)
                "rule-key": function (context) {
                    var exports = {};
                    exports[context.Syntax.Document] = function (node) {
                        var text = context.getSource(node);
                        assert.equal(text, expectedText);
                    };
                    return exports;
                }
            });
            return textlint.lintMarkdown(expectedText);
        });
        it("should get text with padding from TxtNode", function () {
            var expectedText = "this is text.";
            textlint.setupRules({
                // rule-key : rule function(see docs/rule.md)
                "rule-key": function (context) {
                    var exports = {};
                    exports[context.Syntax.Document] = function (node) {
                        var text = context.getSource(node, -1, -1);
                        assert.equal(text, expectedText.slice(1, expectedText.length - 1));
                    };
                    return exports;
                }
            });
            return textlint.lintMarkdown(expectedText);
        });
    });
    describe("#report", function () {
        context("RuleError", function () {
            beforeEach(function () {
                setRunningTest(true);
            });
            context("[backward compatible]", function () {
                beforeEach(function () {
                    setRunningTest(false);
                });
                it("could use 2nd arguments as padding column", function () {
                    textlint.setupRules({
                        "rule-key": function (context) {
                            return {
                                [context.Syntax.Str](node){
                                    // FIXME: this is un-document
                                    // Please remove next version
                                    const ruleError = new context.RuleError("error", 1);
                                    context.report(node, ruleError);
                                }
                            };
                        }
                    });
                    return textlint.lintMarkdown("test").then(result => {
                        assert(result.messages.length === 1);
                        const message = result.messages[0];
                        assert.equal(message.line, 1);
                        assert.equal(message.column, 2);
                    });
                });
            });
            it("could has padding column", function () {
                textlint.setupRules({
                    "rule-key": function (context) {
                        return {
                            [context.Syntax.Str](node){
                                // throw error in testing
                                const ruleError = new context.RuleError("error", 1);
                                context.report(node, ruleError);
                            }
                        };
                    }
                });
                // catch error
                return textlint.lintMarkdown("test").catch(error => {
                    assert(error instanceof Error);
                });
            });
            it("could has padding location", function () {
                textlint.setupRules({
                    "rule-key": function (context) {
                        return {
                            [context.Syntax.Code](node){
                                const ruleError = new context.RuleError("error", {
                                    line: 5,// if line >=1
                                    column: 5// then start with 0 + column
                                });
                                context.report(node, ruleError);
                            }
                        };
                    }
                });
                return textlint.lintMarkdown("test`code`test").then(result => {
                    assert(result.messages.length === 1);
                    const message = result.messages[0];
                    assert.equal(message.line, 6);
                    assert.equal(message.column, 5 + 1);
                });
            });
        });
        it("can also report data", function () {
            var expectedData = {message: "message", key: "value"};
            textlint.setupRules({
                // rule-key : rule function(see docs/rule.md)
                "rule-key": function (context) {
                    return {
                        [context.Syntax.Str](node){
                            context.report(node, expectedData);
                        }
                    };
                }
            });
            return textlint.lintMarkdown("test").then(result => {
                assert(result.messages.length === 1);
                const message = result.messages[0];
                assert.equal(message.message, expectedData.message);
                assert.deepEqual(message.data, expectedData);
            });
        });
    });
    describe("#shouldIgnore", function () {
        context("when ignoreMessages only", function () {
            it("should return empty message", function () {
                textlint.setupFilterRules({
                    "filter-rule": function (context) {
                        return {
                            [context.Syntax.Str](node){
                                context.shouldIgnore(node.range);
                            }
                        };
                    }
                });
                return textlint.lintMarkdown("test").then(result => {
                    assert(result.messages.length === 0);
                });
            });
        });
        context("when ignoreMessages not match message", function () {
            it("should preserve messages", function () {
                textlint.setupRules({
                    "rule": function (context) {
                        return {
                            [context.Syntax.Str](node){
                                context.report(node, new context.RuleError("message"));
                            }
                        };
                    }
                });
                textlint.setupFilterRules({
                    "filter-rule": function (context) {
                        return {
                            [context.Syntax.Code](node){
                                context.shouldIgnore(node.range);
                            }
                        };
                    }
                });
                return textlint.lintMarkdown("test").then(result => {
                    assert(result.messages.length === 1);
                    const [message] = result.messages;
                    assert.equal(message.type, "lint");
                });
            });
        });
        context("when duplicated ignoreMessages", function () {
            it("should messages is ignore", function () {
                textlint.setupRules({
                    "rule": function (context) {
                        return {
                            [context.Syntax.Str](node){
                                context.report(node, new context.RuleError("message"));
                            }
                        };
                    }
                });
                textlint.setupFilterRules({
                    "filter-rule": function (context) {
                        return {
                            [context.Syntax.Str](node){
                                context.shouldIgnore(node.range, {
                                    ruleId: "*"
                                });
                                context.shouldIgnore(node.range, {
                                    ruleId: "*"
                                });
                                context.shouldIgnore(node.range, {
                                    ruleId: "*"
                                });
                            }
                        };
                    }
                });
                return textlint.lintMarkdown("test").then(result => {
                    assert(result.messages.length === 0);
                });
            });
        });
        context("when ignoreMessages that is not specified ruleId", function () {
            it("should return filtered messages by matched ruleId", function () {
                textlint.setupRules({
                    "rule": function (context) {
                        return {
                            [context.Syntax.Str](node){
                                context.report(node, new context.RuleError("message"));
                            }
                        };
                    }
                });
                textlint.setupFilterRules({
                    "filter-rule": function (context) {
                        return {
                            [context.Syntax.Str](node){
                                // no specify ruleId
                                context.shouldIgnore(node.range);
                            }
                        };
                    }
                });
                return textlint.lintMarkdown("test").then(result => {
                    assert(result.messages.length === 1);
                });
            });
        });
        context("when exist messages and ignoreMessages", function () {
            it("should return filtered result by ignoreMessages", function () {
                textlint.setupRules({
                    "rule": function (context) {
                        return {
                            [context.Syntax.Str](node){
                                context.report(node, new context.RuleError("message"));
                            }
                        };
                    }
                });
                textlint.setupFilterRules({
                    "filter-rule": function (context) {
                        return {
                            [context.Syntax.Str](node){
                                context.shouldIgnore(node.range, {
                                    ruleId: "*"
                                });
                            }
                        };
                    }
                });
                return textlint.lintMarkdown("test").then(result => {
                    assert(result.messages.length === 0);
                });
            });
        });
    });

    describe("#getFilePath", function () {
        context("when linting text", function () {
            it("should return undefined", function () {
                textlint.setupRules({
                    "rule-key": function (context) {
                        return {
                            [context.Syntax.Document](){
                                const filePath = context.getFilePath();
                                assert(filePath == null);
                            }
                        };
                    }
                });
                return textlint.lintMarkdown("test");
            });
        });
        context("when linting file", function () {
            it("should return filePath that is linting now", function () {
                const lintFilePath = path.join(__dirname, "fixtures/test.md");
                textlint.setupRules({
                    "rule-key": function (context) {
                        return {
                            [context.Syntax.Document](){
                                const filePath = context.getFilePath();
                                assert.equal(filePath, lintFilePath);
                            }
                        };
                    }
                });
                return textlint.lintFile(lintFilePath);
            });
        });
    });
});
