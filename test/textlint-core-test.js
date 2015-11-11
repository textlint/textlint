import assert from "power-assert";
import {TextLintCore} from "../src/index";
import rule from "./fixtures/rules/example-rule";
describe("textlint-core", function () {
    // Test: https://github.com/textlint/textlint/issues/30
    context("when new textlint-core", function () {
        it("should be clean rule-manager", function () {
            var textlint = new TextLintCore();
            textlint.setupRules({
                "example-rule": rule
            });
            return textlint.lintMarkdown("test").then(result => {
                assert(result.messages.length === 1);
            }).then(() => {
                var newTextLint = new TextLintCore();
                // no rule
                return newTextLint.lintMarkdown("test");
            }).then((result) => {
                assert(result.messages.length === 0)
            });

        });
    });
    context("when a linting text is empty", function () {
        let textlint;
        beforeEach(function () {
            textlint = new TextLintCore();
            textlint.setupRules({
                "example-rule": rule
            });
        });
        it("should not throw an exception", function () {
            return textlint.lintText("").then((result) => {
                assert(result.messages.length === 0);
            });
        });
        it("should not throw an exception", function () {
            return textlint.lintMarkdown("").then((result) => {
                assert(result.messages.length === 0);
            });
        });
        it("should not throw an exception", function () {
            return textlint.lintFile('./test/fixtures/empty.md').then((result) => {
                assert(result.messages.length === 0);
            });
        });
    });
    describe("ruleConfig", function () {
        context("when set ruleConfig.severity", function () {
            it("message.severity should used the config", function () {
                var textlint = new TextLintCore();
                textlint.setupRules({
                    "rule-name": require("./fixtures/rules/example-rule")
                }, {
                    "rule-name": {
                        severity: "warning"
                    }
                });
                return textlint.lintMarkdown("# Test").then(result => {

                    assert(result.filePath === "<markdown>");
                    assert(result.messages.length > 0);
                    let message = result.messages[0];
                    assert(message.severity === 1);

                });
            });
        });
        context("when not set ruleConfig.severity", function () {
            it("message.severity should be error", function () {
                var textlint = new TextLintCore();
                textlint.setupRules({
                    "rule-name": require("./fixtures/rules/example-rule")
                }, {
                    "rule-name": {
                        foo: "bar"
                    }
                });
                return textlint.lintMarkdown("# Test").then(result => {
                    assert(result.filePath === "<markdown>");
                    assert(result.messages.length > 0);
                    let message = result.messages[0];
                    assert(message.severity === 2);
                });
            });
            it("message.severity should be error", function () {
                var textlint = new TextLintCore();
                textlint.setupRules({
                    "rule-name": require("./fixtures/rules/example-rule")
                }, {
                    "rule-name": {
                        severity: "error"
                    }
                });
                return textlint.lintMarkdown("# Test").then(result => {
                    assert(result.filePath === "<markdown>");
                    assert(result.messages.length > 0);
                    let message = result.messages[0];
                    assert(message.severity === 2);
                });
            });
        });
        context("when set wrong ruleConfig.severity", function () {
            it("should throw error", function () {
                var textlint = new TextLintCore();
                assert.throws(function () {
                    textlint.setupRules({
                        "rule-name": require("./fixtures/rules/example-rule")
                    }, {
                        "rule-name": {
                            severity: "xxxxxxxx"
                        }
                    });
                });
            });
        });
    });
});
