// LICENSE : MIT
"use strict";
import assert from "assert";
import path from "path";
import deepClone from "clone";
import { textlint, TextLintCore } from "../../src";
import { assertRuleContext } from "./assert-rule-context";
import { loadFromDir } from "../../src/engine/rule-loader";
import { Config } from "../../src/config/config";
import { TextlintRuleContext, TextlintRuleOptions } from "@textlint/types";

const rules = loadFromDir(path.join(__dirname, "fixtures/rules"));
describe("textlint-test", function () {
    beforeEach(function () {
        // This rule found `Str` Node then occur error
        textlint.setupRules(rules);
    });
    afterEach(function () {
        textlint.resetRules();
    });
    describe("#setupRules", function () {
        context("when pass only rules object", function () {
            it("should pass RuleContext instance to Rule function", function () {
                const rule = function (context: Readonly<TextlintRuleContext>, config: TextlintRuleOptions<never>) {
                    assertRuleContext(context);
                    assert.strictEqual(context.id, "rule-name");
                    assert.strictEqual(config, undefined);
                    return {};
                };
                textlint.setupRules({ "rule-name": rule });
            });
        });
        context("when pass rules object and rules config", function () {
            it("should pass RuleContext instance and RuleConfig to Rule function", function () {
                const ruleConfig = { key: "value" };
                const rule = function (context: Readonly<TextlintRuleContext>, config: TextlintRuleOptions) {
                    assertRuleContext(context);
                    assert.equal(context.id, "rule-name");
                    assert.deepEqual(config, ruleConfig);
                    return {};
                };
                textlint.setupRules({ "rule-name": rule }, { "rule-name": ruleConfig });
            });
        });
        context("when pass textlintConfig to setupRules", function () {
            it("should RuleContext has `config` object", function () {
                const configFile = path.join(__dirname, "fixtures", ".textlintrc");
                const textlint = new TextLintCore(new Config({ configFile }));
                const rule = (
                    context: Readonly<TextlintRuleContext & { config: Config }>,
                    _config: TextlintRuleOptions
                ) => {
                    assertRuleContext(context);
                    assert.ok("config" in context);
                    assert.ok(context.config instanceof Config);
                    assert.equal(context.config.configFile, configFile);
                    return {};
                };
                textlint.setupRules({ "rule-name": rule });
            });
        });
    });
    describe("lintMarkdown", function () {
        it("should found error message", function () {
            const text =
                "# TEST" +
                "\n" +
                "`potet` + **testongst**" +
                "\n" +
                "- list\n" +
                "- test\n" +
                "\n" +
                "hoge\n [a](http://example.com) fuga\n" +
                "------";
            return textlint.lintMarkdown(text).then((result) => {
                assert.ok(result.filePath === "<markdown>");
                assert.ok(result.messages.length > 0);
            });
        });
        it("should has referential transparency", function () {
            const p1 = textlint.lintMarkdown("text");
            const p2 = textlint.lintMarkdown("text");
            return Promise.all([p1, p2]).then(([r1, r2]) => {
                const result_1 = deepClone(r1);
                const result_2 = deepClone(r2);
                assert.equal(result_1.messages.length, result_2.messages.length);
            });
        });
    });
    describe("lintText", function () {
        it("should found error message", function () {
            const text = "It it plain text\n" + "\n" + "Third line.";
            return textlint.lintText(text).then((result) => {
                assert.ok(result.filePath === "<text>");
                assert.ok(result.messages.length > 0);
            });
        });
    });
    describe("lintFile", function () {
        it("filePath is loaded file path", function () {
            const filePath = path.join(__dirname, "fixtures/test.md");
            return textlint.lintFile(filePath).then((result) => {
                assert.ok(result.filePath === filePath);
            });
        });
    });
});
