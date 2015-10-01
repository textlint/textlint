// LICENSE : MIT
"use strict";
var assert = require("power-assert");
var textlint = require("../src/").textlint;
describe("rule-context-test", function () {
    afterEach(function () {
        textlint.resetRules();
    });
    context("to traverse rule", function () {
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
    });
});