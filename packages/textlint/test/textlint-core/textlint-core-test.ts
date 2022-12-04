import * as assert from "assert";
import { TextLintCore } from "../../src";
import exampleRule from "./fixtures/rules/example-rule";
import { createPluginStub } from "../pluguins/fixtures/example-plugin";

describe("textlint-core", function () {
    // Test: https://github.com/textlint/textlint/issues/30
    context("when new textlint-core", function () {
        it("should be clean rule-manager", function () {
            const textlint = new TextLintCore();
            textlint.setupRules({ "example-rule": exampleRule });
            return textlint
                .lintMarkdown("test")
                .then((result) => {
                    assert.ok(result.messages.length === 1);
                })
                .then(() => {
                    const newTextLint = new TextLintCore();
                    // no rule
                    return newTextLint.lintMarkdown("test");
                })
                .then((result) => {
                    assert.ok(result.messages.length === 0);
                });
        });
    });
    context("when a linting text is empty", function () {
        let textlint: TextLintCore;
        beforeEach(function () {
            textlint = new TextLintCore();
            textlint.setupRules({ "example-rule": exampleRule });
        });
        it("should not throw an exception @ text", function () {
            return textlint.lintText("").then((result) => {
                assert.ok(result.messages.length === 0);
            });
        });
        it("should not throw an exception @ markdown", function () {
            return textlint.lintMarkdown("").then((result) => {
                assert.ok(result.messages.length === 0);
            });
        });
        it("should not throw an exception @ file", function () {
            return textlint.lintFile(__dirname + "/fixtures/empty.md").then((result) => {
                assert.ok(result.messages.length === 0);
            });
        });
    });
    context("when a linting a dot file", function () {
        const file = __dirname + "/fixtures/.example";
        let textlint: TextLintCore;
        beforeEach(function () {
            textlint = new TextLintCore();
            textlint.setupRules({ "example-rule": exampleRule });
            const { plugin } = createPluginStub();
            textlint.setupPlugins({ example: plugin });
        });
        it.only("should not throw an exception @ file", function () {
            return textlint.lintFile(file).then((result) => {
                assert.ok(result.messages.length === 0);
            });
        });
        it("should not throw an exception @ fix", function () {
            return textlint.fixFile(file).then((result) => {
                assert.ok(result.messages.length === 0);
            });
        });
    });
    describe("ruleConfig", function () {
        context("when set ruleConfig.severity", function () {
            it("message.severity should used the config", function () {
                const textlint = new TextLintCore();
                textlint.setupRules({ "rule-name": exampleRule }, { "rule-name": { severity: "warning" } });
                return textlint.lintMarkdown("# Test").then((result) => {
                    assert.ok(result.filePath === "<markdown>");
                    assert.ok(result.messages.length > 0);
                    const message = result.messages[0];
                    assert.ok(message.severity === 1);
                });
            });
        });
        context("when not set ruleConfig.severity", function () {
            it("message.severity should be error", function () {
                const textlint = new TextLintCore();
                textlint.setupRules({ "rule-name": exampleRule }, { "rule-name": { foo: "bar" } });
                return textlint.lintMarkdown("# Test").then((result) => {
                    assert.ok(result.filePath === "<markdown>");
                    assert.ok(result.messages.length > 0);
                    const message = result.messages[0];
                    assert.ok(message.severity === 2);
                });
            });
            it("message.severity should be error", function () {
                const textlint = new TextLintCore();
                textlint.setupRules({ "rule-name": exampleRule }, { "rule-name": { severity: "error" } });
                return textlint.lintMarkdown("# Test").then((result) => {
                    assert.ok(result.filePath === "<markdown>");
                    assert.ok(result.messages.length > 0);
                    const message = result.messages[0];
                    assert.ok(message.severity === 2);
                });
            });
        });
        context("when set wrong ruleConfig.severity", function () {
            it("should throw error", function () {
                const textlint = new TextLintCore();
                textlint.setupRules({ "rule-name": exampleRule }, { "rule-name": { severity: "xxxxxxxx" } }); // wrong config
                try {
                    textlint.lintText("test").catch((error) => {
                        assert.ok(error instanceof Error);
                    });
                } catch (error) {
                    assert.ok(error instanceof Error);
                }
            });
        });
    });
    describe("#resetRules", function () {
        it("should reset filterRules", function () {
            const textlint = new TextLintCore();
            textlint.setupFilterRules({ "rule-name": exampleRule });
            assert.strictEqual(textlint.textlintKernelDescriptor.filterRule.descriptors.length, 1);
            textlint.resetRules();
            assert.strictEqual(textlint.textlintKernelDescriptor.filterRule.descriptors.length, 0);
        });
        it("should reset rules", function () {
            const textlint = new TextLintCore();
            textlint.setupRules({ "rule-name": exampleRule });
            return textlint
                .lintText("wrong", ".md")
                .then((result) => {
                    // should be 0>
                    assert.ok(result.messages.length > 0);
                })
                .then(() => {
                    textlint.resetRules();
                })
                .then(() => {
                    // should be 0
                    return textlint.lintText("wrong", ".md").then((result) => {
                        assert.ok(result.messages.length === 0);
                    });
                });
        });
    });
});
