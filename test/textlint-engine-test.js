// LICENSE : MIT
"use strict";
var assert = require("power-assert");
var TextLintEngine = require("../src/").TextLintEngine;
var rulesDir = __dirname + "/fixtures/rules";
var path = require("path");
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
                var config = new Config({
                    rulePaths: [rulesDir]
                });
                let engine = new TextLintEngine(config);
                assert.deepEqual(engine.config.rulePaths, [rulesDir]);
            });
        });
    });
    describe("setup rule", function () {
        context("when rule is a scoped module", function () {
            it("should define rule", function () {
                let engine = new TextLintEngine({
                    rules: ["@textlint/textlint-rule-example"],
                    rulesBaseDirectory: path.join(__dirname, "/fixtures/rules/")
                });
                var ruleNames = engine.ruleManager.getAllRuleNames();
                assert(ruleNames.length === 1);
                const ruleName = ruleNames[0];
                assert(ruleName === "@textlint/textlint-rule-example");
                assert(typeof engine.ruleManager.getRule(ruleName) === "function");
            });
        });
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
        context("when Plugin has not rules", function () {
            it("should not throw Error", function () {
                let engine = new TextLintEngine({
                    plugins: ["markdown"]
                });
                var ruleNames = engine.ruleManager.getAllRuleNames();
                assert(ruleNames.length === 0);
            });
        });
        context("when Plugin is a scoped module", function () {
            it("should define rule of plugin", function () {
                let engine = new TextLintEngine({
                    plugins: ["@textlint/textlint-plugin-example"],
                    rulesBaseDirectory: path.join(__dirname, "/fixtures/plugins/")
                });
                var ruleNames = engine.ruleManager.getAllRuleNames();
                assert(ruleNames.length === 1);
                const ruleName = ruleNames[0];
                assert(ruleName === "@textlint/textlint-plugin-example/example-rule");
                assert(typeof engine.ruleManager.getRule(ruleName) === "function");
            });
        });
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

    describe("#loadPreset", function () {
        context("when preset is a scoped module", function () {
            it("should define rule of preset", function () {
                let engine = new TextLintEngine({
                    presets: ["@textlint/textlint-rule-preset-example"],
                    rulesBaseDirectory: path.join(__dirname, "/fixtures/presets/")
                });
                var ruleNames = engine.ruleManager.getAllRuleNames();
                assert(ruleNames.length === 1);
                const ruleName = ruleNames[0];
                assert(ruleName === "@textlint/textlint-rule-preset-example/example-rule");
                assert(typeof engine.ruleManager.getRule(ruleName) === "function");
            });
        });
        context("when the rule is **not** defined", function () {
            it("should define rules of preset", function () {
                let engine = new TextLintEngine({
                    presets: ["preset-example"],
                    rulesBaseDirectory: path.join(__dirname, "/fixtures/presets/")
                });
                var ruleNames = engine.ruleManager.getAllRuleNames();
                assert(ruleNames.length === 2);
                assert.equal(ruleNames[0], "preset-example/a");
                assert.equal(ruleNames[1], "preset-example/b");
            });
        });
        context("when the rule is defined", function () {
            it("should not load rule", function () {
                let engine = new TextLintEngine({
                    presets: ["preset-example"],
                    rulesBaseDirectory: path.join(__dirname, "/fixtures/presets/")
                });
                var ruleNames = engine.ruleManager.getAllRuleNames();
                assert(ruleNames.length === 2);
                var ruleObject = engine.ruleManager.getRule("preset-example/a");
                // loadRule should ignore
                engine.loadPreset("preset-example");
                assert(ruleNames.length === 2);
                // should equal prev loaded object
                assert(engine.ruleManager.getRule("preset-example/a") === ruleObject);
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
        context("Issue #81 - no assing module.exports = rule", function () {
            it("should interop-require the rule", function () {
                let engine = new TextLintEngine();
                engine.setRulesBaseDirectory(path.join(__dirname, "/fixtures/rules/issue81"));
                engine.addRule("no-default-assign-rule");
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
            return engine.executeOnFiles([filePath]).then(results => {
                assert(Array.isArray(results));
                var fileResult = results[0];
                assert(fileResult.filePath === filePath);
                assert(Array.isArray(fileResult.messages));
                assert(fileResult.messages.length > 0);
            });
        });
        it("should lint a file with same rules", function () {
            let engine = new TextLintEngine();
            var filePath = path.join(__dirname, "fixtures/test.md");
            engine.setRulesBaseDirectory(path.join(__dirname, "/fixtures/rules/"));
            engine.addRule("example-rule");
            var beforeRuleNames = engine.ruleManager.getAllRuleNames();
            return engine.executeOnFiles([filePath]).then(() => {
                var afterRuleNames = engine.ruleManager.getAllRuleNames();
                assert.deepEqual(beforeRuleNames, afterRuleNames);
            });
        });
        context("when process file that has un-available ext ", function () {
            it("should return empty results ", function () {
                let engine = new TextLintEngine();
                var filePath = path.join(__dirname, "fixtures/test.unknown");
                return engine.executeOnFiles([filePath]).then(results => {
                    assert(Array.isArray(results));
                    assert(results.length === 0);
                });
            });
        });
    });
    describe("executeOnText", function () {
        it("should lint a text and return results", function () {
            let engine = new TextLintEngine({
                rulePaths: [rulesDir]
            });
            return engine.executeOnText("text").then(results => {
                assert(Array.isArray(results));
                var lintResult = results[0];
                assert(lintResult.filePath === "<text>");
                assert(Array.isArray(lintResult.messages));
                assert(lintResult.messages.length > 0);
            });
        });
        it("should lint a text with same rules", function () {
            let engine = new TextLintEngine();
            engine.setRulesBaseDirectory(path.join(__dirname, "/fixtures/rules/"));
            engine.loadRule("example-rule");
            var beforeRuleNames = engine.ruleManager.getAllRuleNames();
            return engine.executeOnText("text").then(() => {
                var afterRuleNames = engine.ruleManager.getAllRuleNames();
                assert.deepEqual(beforeRuleNames, afterRuleNames);
            });
        });
        context("when specify ext", function () {
            it("should lint text as ext", function () {
                let engine = new TextLintEngine({
                    rulePaths: [rulesDir]
                });
                return engine.executeOnText("text", ".md").then(results => {
                    assert(Array.isArray(results));
                    var lintResult = results[0];
                    assert(lintResult.filePath === "<markdown>");
                    assert(Array.isArray(lintResult.messages));
                    assert(lintResult.messages.length > 0);
                });
            });
            it("should lint text as ext( of path )", function () {
                let engine = new TextLintEngine({
                    rulePaths: [rulesDir]
                });
                return engine.executeOnText("text", "index.md").then(results => {
                    assert(Array.isArray(results));
                    var lintResult = results[0];
                    assert(lintResult.filePath === "<markdown>");
                    assert(Array.isArray(lintResult.messages));
                    assert(lintResult.messages.length > 0);
                });
            });
        });
    });
    describe("formatResults", function () {
        context("when use default formatter", function () {
            it("should format results and return formatted text", function () {
                let engine = new TextLintEngine({
                    rulePaths: [rulesDir]
                });
                return engine.executeOnText("text").then(results => {
                    var output = engine.formatResults(results);
                    assert(/<text>/.test(output));
                    assert(/problem/.test(output));
                });
            });
        });
        context("when loaded custom formatter", function () {
            it("should return custom formatted text", function () {
                const engine = new TextLintEngine({
                    rulePaths: [rulesDir],
                    formatterName: path.join(__dirname, "fixtures/formatter/example-formatter.js")
                });
                return engine.executeOnText("text").then(results => {
                    var output = engine.formatResults(results);
                    assert(!/<text>/.test(output));
                    assert(/example-formatter/.test(output));
                });
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

