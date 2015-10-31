// LICENSE : MIT
"use strict";
var assert = require("power-assert");
var textlint = require("../src/").textlint;
describe("rule-context-test", function () {
    afterEach(function () {
        textlint.resetRules();
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
                textlint.lintMarkdown("text");
                assert(callCount === 1);
                textlint.lintText("text");
                assert(callCount === 2);
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
    });
    context("report", function () {
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
            let result = textlint.lintMarkdown("test");
            assert(result.messages.length === 1);
            let message = result.messages[0];
            assert.equal(message.message, expectedData.message);
            assert.deepEqual(message.data, expectedData);
        });
    });
});