// LICENSE : MIT
"use strict";
const assert = require("power-assert");
const path = require("path");
const deepClone = require("clone");
import {textlint} from "../../src/";
import {loadFromDir} from "../../src/engine/rule-loader";
import Config from "../../src/config/config";
import RuleContext from "../../src/core/rule-context";
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
                const rule = function (context, config) {
                    assert(context instanceof RuleContext);
                    assert.strictEqual(context.id, "rule-name");
                    assert.strictEqual(config, undefined);
                    return {};
                };
                textlint.setupRules({
                    "rule-name": rule
                });
            });
        });
        context("when pass rules object and rules config", function () {
            it("should pass RuleContext instance and RuleConfig to Rule function", function () {
                var ruleConfig = {
                    "key": "value"
                };
                const rule = function (context, config) {
                    assert(context instanceof RuleContext);
                    assert.equal(context.id, "rule-name");
                    assert.deepEqual(config, ruleConfig);
                    return {};
                };
                textlint.setupRules({
                    "rule-name": rule
                }, {
                    "rule-name": ruleConfig
                });
            });
        });
        context("when pass textlintConfig to setupRules", function () {
            it("should RuleContext has `config` object", function () {
                var configFile = path.join(__dirname, "fixtures", ".textlintrc");
                textlint.config = new Config({
                    configFile: configFile
                });
                const rule = (context, config) => {
                    assert(context instanceof RuleContext);
                    assert(context.config instanceof Config);
                    assert.equal(context.config.configFile, configFile);
                    return {};
                };
                textlint.setupRules({
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
            return textlint.lintMarkdown(text).then(result => {
                assert(result.filePath === "<markdown>");
                assert(result.messages.length > 0);
            });
        });
        it("should has referential transparency", function () {
            var p1 = textlint.lintMarkdown("text");
            var p2 = textlint.lintMarkdown("text");
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
            return textlint.lintText(text).then(result => {
                assert(result.filePath === "<text>");
                assert(result.messages.length > 0);
            });
        });
    });
    describe("lintFile", function () {
        it("filePath is loaded file path", function () {
            var filePath = path.join(__dirname, "fixtures/test.md");
            return textlint.lintFile(filePath).then(result => {
                assert(result.filePath === filePath);
            });
        });
    });
});
