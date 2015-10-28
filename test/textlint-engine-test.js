// LICENSE : MIT
"use strict";
var assert = require("power-assert");
var TextLintEngine = require("../src/").TextLintEngine;
var rulesDir = __dirname + "/fixtures/rules";
var path = require('path');
describe("textlint-engine-test", function () {
    describe("Constructor", function () {
        context("when no-args", function () {
            it("config should be empty", function () {
                let engine = new TextLintEngine();
                assert.deepEqual(engine.config.rulePaths, []);
            });
        });
        context("when args is object", function () {
            it("should convert the object and set config", function () {
                let engine = new TextLintEngine({
                    rulePaths: [rulesDir]
                });
                assert.deepEqual(engine.config.rulePaths, [rulesDir]);
            });
        });
        context("when args is Config object", function () {
            it("should set directory to config", function () {
                // Issue : when use Config as argus, have to export `../src/config/config`
                var Config = require("../src/config/config");
                var config = new Config();
                config.rulePaths = [rulesDir];
                let engine = new TextLintEngine(config);
                assert.deepEqual(engine.config.rulePaths, [rulesDir]);
            });
        });
    });
    describe("setup rule", function () {
        context("when (textlint-rule-)no-todo is specified", function () {
            it("should set `no-todo` as key to rule dict", function () {
                let engine = new TextLintEngine({
                    rules: ["no-todo"]
                });
                var ruleNames = engine.ruleManager.getAllRuleNames();
                assert(ruleNames.length > 0);
                assert.equal(ruleNames[0], "no-todo");
            });
        });
        context("when textlint-rule-no-todo is specified", function () {
            it("should set `no-todo` as key to rule dict", function () {
                let engine = new TextLintEngine({
                    rules: ["textlint-rule-no-todo"]
                });
                var ruleNames = engine.ruleManager.getAllRuleNames();
                assert(ruleNames.length > 0);
                assert.equal(ruleNames[0], "no-todo");
            });
        });
    });
    describe("#loadPlugin", function () {
        context("when the rule is **not** defined", function () {
            it("should define rules of plugin", function () {
                let engine = new TextLintEngine();
                engine.setRulesBaseDirectory(path.join(__dirname, "/fixtures/plugins/"));
                engine.loadPlugin("example");
                var ruleNames = engine.ruleManager.getAllRuleNames();
                assert(ruleNames.length > 0);
                assert.equal(ruleNames[0], "example/example-rule");
            });
        });
        context("when the rule is defined", function () {
            it("should not re-load rule", function () {
                let engine = new TextLintEngine();
                engine.setRulesBaseDirectory(path.join(__dirname, "/fixtures/plugins/"));
                engine.loadPlugin("example");
                var ruleNames = engine.ruleManager.getAllRuleNames();
                assert(ruleNames.length === 1);
                var ruleObject = engine.ruleManager.getRule(ruleNames[0]);
                // loadRule should ignore
                engine.loadPlugin("example");
                // should equal prev loaded object
                assert(engine.ruleManager.getRule("example/example-rule") === ruleObject);
            });
        });
    });

    describe("#loadRule", function () {
        context("when the rule is **not** defined", function () {
            it("should define the rule", function () {
                let engine = new TextLintEngine();
                engine.loadRule("textlint-rule-no-todo");
                var ruleNames = engine.ruleManager.getAllRuleNames();
                assert(ruleNames.length > 0);
                assert.equal(ruleNames[0], "no-todo");
            });
        });
        context("when the rule is defined", function () {
            it("should not re-load rule", function () {
                let engine = new TextLintEngine();
                engine.loadRule("textlint-rule-no-todo");
                var ruleNames = engine.ruleManager.getAllRuleNames();
                assert(ruleNames.length === 1);
                var ruleObject = engine.ruleManager.getRule(ruleNames[0]);
                // loadRule should ignore
                engine.loadRule("textlint-rule-no-todo");
                // should equal prev loaded object
                assert(engine.ruleManager.getRule("no-todo") === ruleObject);
            });
        });
        context("when use the rule directory", function () {
            it("should load rule from path", function () {
                let engine = new TextLintEngine();
                engine.setRulesBaseDirectory(path.join(__dirname, "/fixtures/rules/"));
                engine.addRule("example-rule");
                var ruleNames = engine.ruleManager.getAllRuleNames();
                assert(ruleNames.length === 1);
            });
        });
    });
    describe("executeOnFiles", function () {
        it("should found error message", function () {
            let engine = new TextLintEngine({
                rulePaths: [rulesDir]
            });
            var filePath = path.join(__dirname, "fixtures/test.md");
            var results = engine.executeOnFiles([filePath]);
            assert(Array.isArray(results));
            var fileResult = results[0];
            assert(fileResult.filePath === filePath);
            assert(Array.isArray(fileResult.messages));
            assert(fileResult.messages.length > 0);
        });
        it("should lint a file with same rules", function () {
            let engine = new TextLintEngine();
            var filePath = path.join(__dirname, "fixtures/test.md");
            engine.setRulesBaseDirectory(path.join(__dirname, "/fixtures/rules/"));
            engine.addRule("example-rule");
            var beforeRuleNames = engine.ruleManager.getAllRuleNames();
            engine.executeOnFiles([filePath]);
            var afterRuleNames = engine.ruleManager.getAllRuleNames();
            assert.deepEqual(beforeRuleNames, afterRuleNames);
        });
        context("when process file that has un-available ext ", function () {
            it("should return empty results ", function () {
                let engine = new TextLintEngine();
                var filePath = path.join(__dirname, "fixtures/test.unknown");
                var results = engine.executeOnFiles([filePath]);
                assert(Array.isArray(results));
                assert(results.length === 0);
            });
        });
    });
    describe("executeOnText", function () {
        it("should lint a text and return results", function () {
            let engine = new TextLintEngine({
                rulePaths: [rulesDir]
            });
            var results = engine.executeOnText("text");
            assert(Array.isArray(results));
            var lintResult = results[0];
            assert(lintResult.filePath === "<text>");
            assert(Array.isArray(lintResult.messages));
            assert(lintResult.messages.length > 0);
        });
        it("should lint a text with same rules", function () {
            let engine = new TextLintEngine();
            engine.setRulesBaseDirectory(path.join(__dirname, "/fixtures/rules/"));
            engine.loadRule("example-rule");
            var beforeRuleNames = engine.ruleManager.getAllRuleNames();
            engine.executeOnText("text");
            var afterRuleNames = engine.ruleManager.getAllRuleNames();
            assert.deepEqual(beforeRuleNames, afterRuleNames);
        });
    });
    describe("formatResults", function () {
        context("when use default formatter", function () {
            it("should format results and return formatted text", function () {
                let engine = new TextLintEngine({
                    rulePaths: [rulesDir]
                });
                var results = engine.executeOnText("text");
                var output = engine.formatResults(results);
                assert(/<text>/.test(output));
                assert(/problem/.test(output));
            });
        });
        context("when loaded custom formatter", function () {
            it("should return custom formatted text", function () {
                let engine = new TextLintEngine({
                    rulePaths: [rulesDir],
                    formatterName: path.join(__dirname, "fixtures/formatter/example-formatter.js")
                });
                var results = engine.executeOnText("text");
                var output = engine.formatResults(results);
                assert(!/<text>/.test(output));
                assert(/example-formatter/.test(output));
            });
        });
    });
    // TODO: deprecated method
    describe("#setRulesBaseDirectory", function () {
        it("should change rulesBaseDirectory of config", function () {
            let engine = new TextLintEngine();
            var directory = path.join(__dirname, "/fixtures/rules/");
            engine.setRulesBaseDirectory(directory);
            assert.equal(engine.config.rulesBaseDirectory, directory);
        });
    });
});

