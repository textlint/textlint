import assert from "power-assert";
import TextLintCore from "../src/textlint-core";
import rule from "./fixtures/rules/example-rule";
describe("textlint-core", function () {
    // Test: https://github.com/azu/textlint/issues/30
    context("when new textlint-core", function () {
        it("should be clean rule-manager", function () {
            var textlint1 = new TextLintCore();
            textlint1.setupRules({
                "example-rul": rule
            });
            var results1 = textlint1.lintMarkdown("test");
            assert(results1.messages.length === 1);
            var textlint2 = new TextLintCore();
            var results2 = textlint2.lintMarkdown("test");
            assert(results2.messages.length === 0);
        });
    });
});
