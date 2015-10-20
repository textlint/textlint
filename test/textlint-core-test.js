import assert from "power-assert";
import {TextLintCore} from "../src/index";
import rule from "./fixtures/rules/example-rule";
describe("textlint-core", function () {
    // Test: https://github.com/azu/textlint/issues/30
    context("when new textlint-core", function () {
        it("should be clean rule-manager", function () {
            var textlint = new TextLintCore();
            textlint.setupRules({
                "example-rule": rule
            });
            var results1 = textlint.lintMarkdown("test");
            assert(results1.messages.length === 1);
            var textlint2 = new TextLintCore();
            var results2 = textlint2.lintMarkdown("test");
            assert(results2.messages.length === 0);
        });
    });
    describe("ruleConfig", function () {
        context("when set ruleConfig.warning", function () {
            it("message.severity should be warning", function () {
                var textlint = new TextLintCore();
                textlint.setupRules({
                    "rule-name": require("./fixtures/rules/example-rule")
                }, {
                    "rule-name": {
                        warning: true
                    }
                });
                var result = textlint.lintMarkdown("# Test");
                assert(result.filePath === "<markdown>");
                assert(result.messages.length > 0);
                let message = result.messages[0];
                assert(message.severity === 1);
            });
        });
    });
});
