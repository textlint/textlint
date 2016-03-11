// LICENSE : MIT
"use strict";
var assert = require("power-assert");
var path = require("path");
var deepClone = require("clone");
var textLint = require("../src/").textlint;
import {loadFromDir} from "../src/engine/rule-loader";
var Config = require("../src/config/config");
var RuleContext = require("../src/rule/rule-context");
var rules = loadFromDir(__dirname + "/fixtures/rules");
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
                textLint.config = new Config({
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
                }, null);
            });
        });
    });
    describe("lintMarkdown", function () {
        it("should found error message", function () {
            var text = "# TEST" +
                "\n" +
                "`potet` + **testongst**" +
                "\n" +
                "- list\n" +
                "- test\n" +
                "\n" +
                "hoge\n [a](http://example.com) fuga\n" +
                "------";
            return textLint.lintMarkdown(text).then(result => {
                assert(result.filePath === "<markdown>");
                assert(result.messages.length > 0);
            });
        });
        it("should has referential transparency", function () {
            var p1 = textLint.lintMarkdown("text");
            var p2 = textLint.lintMarkdown("text");
            return Promise.all([p1, p2]).then(([r1, r2]) => {
                var result_1 = deepClone(r1);
                var result_2 = deepClone(r2);
                assert.equal(result_1.messages.length, result_2.messages.length);
            });
        });
    });
    describe("lintText", function () {
        it("should found error message", function () {
            var text = "It it plain text\n" +
                "\n" +
                "Third line.";
            return textLint.lintText(text).then(result => {
                assert(result.filePath === "<text>");
                assert(result.messages.length > 0);
            });
        });
    });
    describe("lintFile", function () {
        it("filePath is loaded file path", function () {
            var filePath = path.join(__dirname, "fixtures/test.md");
            return textLint.lintFile(filePath).then(result => {
                assert(result.filePath === filePath);
            });
        });
    });
});
