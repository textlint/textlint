// LICENSE : MIT
"use strict";
var assert = require("power-assert");
var textlint = require("../").textlint;
describe("rule-context-test", function () {
    afterEach(function () {
        textlint.resetRules();
    });
    //it("should", function () {
    //    textlint.setupRules({
    //        // rule-key : rule function(see docs/create-rules.md)
    //        "rule-key": function (context) {
    //            var exports = {};
    //            exports[context.Syntax.Str] = function (node) {
    //                var parent = node.parent;
    //                assert.equal(parent.type, context.Syntax.Paragraph);
    //            };
    //            return exports;
    //        }
    //    });
    //    textlint.lintMarkdown("string");
    //});
});