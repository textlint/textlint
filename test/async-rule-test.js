// LICENSE : MIT
"use strict";
import {TextLintCore, TextLintEngine} from "../src/index";
import path from "path";
import assert from "power-assert";
describe("Async", function () {
    it("should support async", function () {
        var textlint = new TextLintCore();
        textlint.setupRules({
            "rule-name": function (context) {
                let { Syntax, report, RuleError } = context;

                return {
                    [Syntax.Str](node){
                        return new Promise((resolve) => {
                            setTimeout(()=> {
                                report(node, new RuleError("before"));
                                resolve();
                            }, 100);
                        });
                    },
                    [Syntax.Str + ":exit"](node){
                        report(node, new RuleError("after"));
                    }
                }
            }
        });
        return textlint.lintMarkdown("string").then(result => {
            assert(result.filePath === "<markdown>");
            assert(result.messages.length === 2);
        });
    });
    it("should promise each messages", function () {
        var textlint = new TextLintCore();
        // each rule throw 1 error.
        textlint.setupRules({
            "example-rule": require("./fixtures/rules/example-rule"),
            "async-rule": require("./fixtures/rules/async-rule"),
            "example2-rule": require("./fixtures/rules/example-rule"),
            "example3-rule": require("./fixtures/rules/example-rule"),
            "async2-rule": require("./fixtures/rules/async-rule")
        });
        return textlint.lintMarkdown("string").then(result => {
            assert(result.messages.length === 5);
        });
    });
    it("should promise each messages on multiple files", function () {
        const rules = ["async-rule", "example-rule"];
        var engine = new TextLintEngine({
            rulesBaseDirectory: path.join(__dirname, "fixtures", "rules"),
            rules: rules
        });
        var targetFile = path.join(__dirname, "fixtures", "test.md");
        const files = [targetFile, targetFile, targetFile];
        return engine.executeOnFiles(files).then(results => {
            assert.equal(results.length, files.length);
            results.forEach(result => {
                assert.equal(result.messages.length, rules.length);
            });
        });
    });
});