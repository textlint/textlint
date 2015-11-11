// LICENSE : MIT
"use strict";
const assert = require("power-assert");
import { TextLintCore } from "../src/index";
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
                    // rule-key : rule function(see docs/create-rules.md)
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
                return textlint.lintMarkdown("text").then(()=> {
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
                    // rule-key : rule function(see docs/create-rules.md)
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
                textlint.lintMarkdown("text");
                assert(callCount === 1);
                textlint.lintText("text");
                assert(callCount === 2);
            });
        });
    });
    describe("#getSource", function () {
        it("should get text from TxtNode", function () {
            var expectedText = "this is text.";
            textlint.setupRules({
                // rule-key : rule function(see docs/create-rules.md)
                "rule-key": function (context) {
                    var exports = {};
                    exports[context.Syntax.Document] = function (node) {
                        var text = context.getSource(node);
                        assert.equal(text, expectedText);
                    };
                    return exports;
                }
            });
            textlint.lintMarkdown(expectedText);
        });
        it("should get text with padding from TxtNode", function () {
            var expectedText = "this is text.";
            textlint.setupRules({
                // rule-key : rule function(see docs/create-rules.md)
                "rule-key": function (context) {
                    var exports = {};
                    exports[context.Syntax.Document] = function (node) {
                        var text = context.getSource(node, -1, -1);
                        assert.equal(text, expectedText.slice(1, expectedText.length - 1));
                    };
                    return exports;
                }
            });
            textlint.lintMarkdown(expectedText);
        });
    });
    describe("#report", function () {
        it("also report data", function () {
            var expectedData = {message: "message", key: "value"};
            textlint.setupRules({
                // rule-key : rule function(see docs/create-rules.md)
                "rule-key": function (context) {
                    return {
                        [context.Syntax.Str](node){
                            context.report(node, expectedData);
                        }
                    }
                }
            });
            return textlint.lintMarkdown("test").then(result =>{
                assert(result.messages.length === 1);
                let message = result.messages[0];
                assert.equal(message.message, expectedData.message);
                assert.deepEqual(message.data, expectedData);
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
                                let filePath = context.getFilePath();
                                assert(filePath == null);
                            }
                        };
                    }
                });
                textlint.lintMarkdown("test");
            });
        });
        context("when linting file", function () {
            it("should return filePath that is linting now", function () {
                let lintFilePath = __dirname + "/fixtures/test.md";
                textlint.setupRules({
                    "rule-key": function (context) {
                        return {
                            [context.Syntax.Document](){
                                let filePath = context.getFilePath();
                                assert.equal(filePath, lintFilePath);
                            }
                        };
                    }
                });
                textlint.lintFile(lintFilePath);
            });
        });
    });
});