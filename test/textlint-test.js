// LICENSE : MIT
"use strict";
var assert = require("power-assert");
var path = require("path");
var deepClone = require("clone");
var textLint = require("../").textlint;
var loadRules = require("../lib/rule/load-rules");
var Config = require("../lib/config/config");
var RuleContext = require("../lib/rule/rule-context");
var rules = loadRules(__dirname + "/fixtures/rules");
describe("textlint-test", function () {
    beforeEach(function () {
        // This rule found `Str` Node then occur error
        textLint.setupRules(rules);
    });
    afterEach(function () {
        textLint.resetRules();
    });
    describe("#setupRules", function () {
        context("when pass only rules object", function () {
            it("should pass RuleContext instance to Rule function", function () {
                var rule = function (context, config) {
                    assert(context instanceof RuleContext);
                    assert.strictEqual(context.id, "rule-name");
                    assert.strictEqual(config, undefined);
                    return {};
                };
                textLint.setupRules({
                    "rule-name": rule
                });
            });
        });
        context("when pass rules object and rules config", function () {
            it("should pass RuleContext instance and RuleConfig to Rule function", function () {
                var ruleConfig = {
                    "key": "value"
                };
                var rule = function (context, config) {
                    assert(context instanceof RuleContext);
                    assert.equal(context.id, "rule-name");
                    assert.deepEqual(config, ruleConfig);
                    return {};
                };
                textLint.setupRules({
                    "rule-name": rule
                }, {
                    "rule-name": ruleConfig
                });
            });
        });
        context("when pass textlintConfig to setupRules", function () {
            it("should RuleContext has `config` object", function () {
                var configFile = path.join(__dirname, "fixtures", ".textlintrc");
                var textlintConfig = new Config({
                    configFile: configFile
                });
                var rule = function (context, config) {
                    assert(context instanceof RuleContext);
                    assert(context.config instanceof Config);
                    assert.equal(context.config.configFile, configFile);
                    return {};
                };
                textLint.setupRules({
                    "rule-name": rule
                }, null, textlintConfig);
            });
        });
    });
    describe("lintMarkdown", function () {
        it("should found error message", function () {
            var result = textLint.lintMarkdown("# TEST" +
                "\n" +
                "`potet` + **testongst**" +
                "\n" +
                "- list\n" +
                "- test\n" +
                "\n" +
                "hoge\n [a](http://example.com) fuga\n" +
                "------");
            assert(result.filePath === "<markdown>");
            assert(result.messages.length > 0);
        });
        it("should has referential transparency", function () {
            var result_1 = deepClone(textLint.lintMarkdown("text"));
            var result_2 = deepClone(textLint.lintMarkdown("text"));
            assert.equal(result_1.messages.length, result_2.messages.length);
        });
    });
    describe("lintText", function () {
        it("should found error message", function () {
            var result = textLint.lintText("It it plain text\n" +
                "\n" +
                "Third line.");
            assert(result.filePath === "<text>");
            assert(result.messages.length > 0);
        });
        it("should has referential transparency", function () {
            var result_1 = deepClone(textLint.lintMarkdown("text"));
            var result_2 = deepClone(textLint.lintMarkdown("text"));
            assert.equal(result_1.messages.length, result_2.messages.length);
        });
    });
    describe("lintFile", function () {
        it("filePath is loaded file path", function () {
            var filePath = require("path").join(__dirname, "fixtures/test.md");
            var result = textLint.lintFile(filePath);
            assert(result.filePath === filePath);
        });
    });
});