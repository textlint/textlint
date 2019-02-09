// LICENSE : MIT
"use strict";
import { TextlintKernelDescriptor } from "@textlint/kernel";

const assert = require("assert");
const path = require("path");
import { TextLintEngine } from "../../src/";
import { Config } from "../../src/config/config";

const rulesDir = path.join(__dirname, "fixtures/textlint-engine/rules");
const filterRulesDir = path.join(__dirname, "fixtures/textlint-engine/filters");
const pluginsDir = path.join(__dirname, "fixtures/textlint-engine/plugins");
const presetsDir = path.join(__dirname, "fixtures/textlint-engine/presets");

const getRuleDescriptor = (descriptor: TextlintKernelDescriptor, ruleName: string) => {
    const ruleAllRuleDescriptor = descriptor.rule.allDescriptors.find(ruleDescriptor => ruleDescriptor.id === ruleName);
    return ruleAllRuleDescriptor && ruleAllRuleDescriptor;
};
const getRule = (descriptor: TextlintKernelDescriptor, ruleName: string) => {
    const ruleAllRuleDescriptor = getRuleDescriptor(descriptor, ruleName);
    return ruleAllRuleDescriptor && ruleAllRuleDescriptor.rule;
};
const getRuleOptions = (descriptor: TextlintKernelDescriptor, ruleName: string) => {
    const ruleAllRuleDescriptor = getRuleDescriptor(descriptor, ruleName);
    return ruleAllRuleDescriptor && ruleAllRuleDescriptor.rawOptions;
};

const getRuleNames = (descriptor: TextlintKernelDescriptor) => {
    return descriptor.rule.allDescriptors.map(ruleDescriptor => ruleDescriptor.id);
};

const getFilterRule = (descriptor: TextlintKernelDescriptor, ruleName: string) => {
    const ruleAllRuleDescriptor = descriptor.filterRule.allDescriptors.find(
        ruleDescriptor => ruleDescriptor.id === ruleName
    );
    return ruleAllRuleDescriptor && ruleAllRuleDescriptor.rule;
};
const getFilterRuleNames = (descriptor: TextlintKernelDescriptor) => {
    return descriptor.filterRule.allDescriptors.map(ruleDescriptor => ruleDescriptor.id);
};

describe("textlint-engine-test", function() {
    describe("Constructor", function() {
        context("when no-args", function() {
            it("config should be empty", function() {
                const engine = new TextLintEngine();
                assert.deepEqual((engine as any).config.rulePaths, []);
            });
        });
        context("when args is object", function() {
            it("should convert the object and set config", function() {
                const engine = new TextLintEngine({ rulePaths: [rulesDir] });
                assert.deepEqual((engine as any).config.rulePaths, [rulesDir]);
            });
        });
        context("when args is Config object", function() {
            it("should set directory to config", function() {
                // Issue : when use Config as arguments, have to export `../src/config/config`
                const config = new Config({ rulePaths: [rulesDir] });
                const engine = new TextLintEngine(config);
                assert.deepEqual((engine as any).config.rulePaths, [rulesDir]);
            });
        });
    });
    describe("setup rule", function() {
        context("when rule is a scoped module", function() {
            it("should define rule", function() {
                const engine = new TextLintEngine({
                    rules: ["@textlint/textlint-rule-example"],
                    rulesBaseDirectory: rulesDir
                });
                const ruleNames = getRuleNames(engine.textlintrcDescriptor);
                assert(ruleNames.length === 1);
                const ruleName = ruleNames[0];
                assert(ruleName === "@textlint/example");
                assert(typeof getRule(engine.textlintrcDescriptor, ruleName) === "function");
            });
        });
        context("when (textlint-rule-)no-todo is specified", function() {
            it("should set `no-todo` as key to rule dict", function() {
                const engine = new TextLintEngine({ rules: ["no-todo"] });
                const ruleNames = getRuleNames(engine.textlintrcDescriptor);
                assert(ruleNames.length > 0);
                assert.equal(ruleNames[0], "no-todo");
            });
        });
        context("when textlint-rule-no-todo is specified", function() {
            it("should set `no-todo` as key to rule dict", function() {
                const engine = new TextLintEngine({ rules: ["textlint-rule-no-todo"] });
                const ruleNames = getRuleNames(engine.textlintrcDescriptor);
                assert(ruleNames.length > 0);
                assert.equal(ruleNames[0], "no-todo");
            });
        });
    });
    describe("#loadPlugin", function() {
        context("when Plugin has rules", function() {
            it("should throw Error", function() {
                assert.throws(() => {
                    new TextLintEngine({ rulesBaseDirectory: pluginsDir, plugins: ["invalid"] });
                }, Error);
            });
        });
        context("when Processor Plugin is a scoped module", function() {
            it("should define processor of plugin", function() {
                const engine = new TextLintEngine({ plugins: ["html"] });
                assert(engine.textlintrcDescriptor.plugin.descriptors.length > 0);
            });
        });
        context("when Plugin has not rules", function() {
            it("should not throw Error", function() {
                const engine = new TextLintEngine({ plugins: ["@textlint/markdown"] });
                const ruleNames = getRuleNames(engine.textlintrcDescriptor);
                assert(ruleNames.length === 0);
            });
        });
        context("when the rule is defined", function() {
            it("should not re-load rule", function() {
                const engine = new TextLintEngine({ rulesBaseDirectory: rulesDir });
                engine.loadRule("example");
                const ruleNames = getRuleNames(engine.textlintrcDescriptor);
                assert(ruleNames.length === 1);
                const ruleOptions = engine.textlintrcDescriptor.rule.descriptors[0].rawOptions;
                // loadRule should ignore
                engine.loadRule("example");
                // should equal prev loaded object
                assert.strictEqual(engine.textlintrcDescriptor.rule.descriptors[0].rawOptions, ruleOptions);
            });
        });
        context("when loading html plugin", function() {
            it("should add .html to availableExtensions", function() {
                const engine = new TextLintEngine({ plugins: ["html"] });
                const availableExtensions = engine.textlintrcDescriptor.availableExtensions;
                assert(availableExtensions.indexOf(".html") !== -1);
            });
            it("manually loading case, should add .html to availableExtensions", function() {
                const engine = new TextLintEngine();
                assert(engine.textlintrcDescriptor.availableExtensions.indexOf(".html") === -1);
                engine.loadPlugin("html");
                assert.ok(engine.textlintrcDescriptor.availableExtensions.includes(".html"), " should includes .html");
            });
        });
    });

    describe("#loadPreset", function() {
        context("when preset is a scoped module", function() {
            it("should define rule of preset", function() {
                const engine = new TextLintEngine({
                    presets: ["@textlint/textlint-rule-preset-example"],
                    rulesBaseDirectory: presetsDir
                });
                const ruleNames = getRuleNames(engine.textlintrcDescriptor);
                assert.strictEqual(ruleNames.length, 1);
                const ruleName = ruleNames[0];
                assert.strictEqual(ruleName, "@textlint/example/example-rule");
                assert.strictEqual(typeof getRule(engine.textlintrcDescriptor, ruleName), "function");
            });
        });
        context("when the rule is **not** defined", function() {
            it("should define rules of preset", function() {
                const engine = new TextLintEngine({ presets: ["example"], rulesBaseDirectory: presetsDir });
                const ruleNames = getRuleNames(engine.textlintrcDescriptor);
                assert(ruleNames.length === 2);
                assert.strictEqual(ruleNames[0], "example/a");
                assert.strictEqual(ruleNames[1], "example/b");
            });
        });
        context("when the rule is defined", function() {
            it("should not load rule", function() {
                const engine = new TextLintEngine({ presets: ["example"], rulesBaseDirectory: presetsDir });
                const ruleNames = getRuleNames(engine.textlintrcDescriptor);
                assert(ruleNames.length === 2);

                const ruleObject = getRuleOptions(engine.textlintrcDescriptor, "example/a");
                // FIXME: loadRule should ignore
                engine.loadPreset("example");
                assert(ruleNames.length === 2);
                // should equal prev loaded object
                assert(getRuleOptions(engine.textlintrcDescriptor, "example/a") === ruleObject);
            });
        });
    });

    describe("#loadRule", function() {
        context("when the rule is **not** defined", function() {
            it("should define the rule", function() {
                const engine = new TextLintEngine();
                engine.loadRule("textlint-rule-no-todo");
                const ruleNames = getRuleNames(engine.textlintrcDescriptor);
                assert(ruleNames.length > 0);
                assert.equal(ruleNames[0], "no-todo");
            });
        });
        context("when the rule is defined", function() {
            it("should not re-load rule", function() {
                const engine = new TextLintEngine();
                const ruleName = "textlint-rule-no-todo";
                engine.loadRule(ruleName);
                const ruleNames = getRuleNames(engine.textlintrcDescriptor);
                assert(ruleNames.length === 1);
                const ruleObject = getRule(engine.textlintrcDescriptor, ruleName);
                // loadRule should ignore
                engine.loadRule(ruleName);
                // should equal prev loaded object
                assert.strictEqual(getRule(engine.textlintrcDescriptor, ruleName), ruleObject);
            });
        });
        context("when use the rule directory", function() {
            it("should load rule from path", function() {
                const engine = new TextLintEngine({ rulesBaseDirectory: rulesDir });
                engine.loadRule("example-rule");
                const ruleNames = getRuleNames(engine.textlintrcDescriptor);
                assert(ruleNames.length === 1);
            });
        });
        context("Issue #81 - no assing module.exports = rule", function() {
            it("should interop-require the rule", function() {
                const engine = new TextLintEngine({
                    rulesBaseDirectory: path.join(__dirname, "/fixtures/textlint-engine/issue81")
                });
                engine.loadRule("no-default-assign-rule");
                const ruleNames = getRuleNames(engine.textlintrcDescriptor);
                assert(ruleNames.length === 1);
            });
        });
    });
    describe("#loadFilerRule", function() {
        context("when the rule is **not** defined", function() {
            it("should define the rule", function() {
                const engine = new TextLintEngine();
                engine.loadFilerRule("textlint-filter-rule-comments");
                const ruleNames = getFilterRuleNames(engine.textlintrcDescriptor);
                assert.deepStrictEqual(ruleNames, ["comments"]);
            });
        });
        context("when the rule is defined", function() {
            it("should not re-load rule", function() {
                const engine = new TextLintEngine();
                engine.loadFilerRule("textlint-filter-rule-comments");
                const ruleNames = getFilterRuleNames(engine.textlintrcDescriptor);
                assert(ruleNames.length === 1);
                const ruleObject = getFilterRule(engine.textlintrcDescriptor, ruleNames[0]);
                // loadRule should ignore
                // textlint-filter-rule-comments
                engine.loadFilerRule("comments");
                // should equal prev loaded object
                assert(getFilterRule(engine.textlintrcDescriptor, "comments") === ruleObject);
            });
        });
        context("when use the rule directory", function() {
            it("should load filter rule from path", function() {
                const engine = new TextLintEngine({ rulesBaseDirectory: filterRulesDir });
                engine.loadFilerRule("filter-rule");
                const ruleNames = getFilterRuleNames(engine.textlintrcDescriptor);
                assert(ruleNames.length === 1);
            });
        });
    });
    describe("executeOnFiles", function() {
        it("should found error message", function() {
            const engine = new TextLintEngine({ rulePaths: [rulesDir] });
            const filePath = path.join(__dirname, "fixtures/test.md");
            return engine.executeOnFiles([filePath]).then(results => {
                assert(Array.isArray(results));
                const fileResult = results[0];
                assert(fileResult.filePath === filePath);
                assert(Array.isArray(fileResult.messages));
                assert(fileResult.messages.length > 0);
            });
        });
        it("should lint a file with same rules", function() {
            const engine = new TextLintEngine({ rulesBaseDirectory: rulesDir });
            const filePath = path.join(__dirname, "fixtures/test.md");
            engine.loadRule("example-rule");
            const beforeRuleNames = getRuleNames(engine.textlintrcDescriptor);
            return engine.executeOnFiles([filePath]).then(() => {
                const afterRuleNames = getRuleNames(engine.textlintrcDescriptor);
                assert.deepEqual(beforeRuleNames, afterRuleNames);
            });
        });
        context("when process file that has un-available ext ", function() {
            it("should return empty results ", function() {
                const engine = new TextLintEngine();
                const filePath = path.join(__dirname, "fixtures/test.unknown");
                return engine.executeOnFiles([filePath]).then(results => {
                    assert(Array.isArray(results));
                    assert(results.length === 0);
                });
            });
        });
    });
    describe("executeOnText", function() {
        it("should lint a text and return results", function() {
            const engine = new TextLintEngine({ rulePaths: [rulesDir] });
            return engine.executeOnText("text").then(results => {
                assert(Array.isArray(results));
                const lintResult = results[0];
                assert(lintResult.filePath === "<text>");
                assert(Array.isArray(lintResult.messages));
                assert(lintResult.messages.length > 0);
            });
        });
        it("should lint a text with same rules", function() {
            const engine = new TextLintEngine({ rulesBaseDirectory: rulesDir });
            engine.loadRule("example-rule");
            const beforeRuleNames = getRuleNames(engine.textlintrcDescriptor);
            return engine.executeOnText("text").then(() => {
                const afterRuleNames = getRuleNames(engine.textlintrcDescriptor);
                assert.deepEqual(beforeRuleNames, afterRuleNames);
            });
        });
        context("when set rule and filter", function() {
            it("should lint a text, result is filtered", function() {
                const engine = new TextLintEngine();
                engine.loadRule(path.join(rulesDir, "example-rule.js"));
                engine.loadFilerRule(path.join(filterRulesDir, "filter-rule.js"));
                return engine.executeOnText("String is error,but it is filtered").then(results => {
                    const [result] = results;
                    assert.equal(result.messages.length, 0);
                });
            });
        });
        context("when specify ext", function() {
            it("should lint text as ext", function() {
                const engine = new TextLintEngine({ rulePaths: [rulesDir] });
                return engine.executeOnText("text", ".md").then(results => {
                    assert(Array.isArray(results));
                    const lintResult = results[0];
                    assert(lintResult.filePath === "<markdown>");
                    assert(Array.isArray(lintResult.messages));
                    assert(lintResult.messages.length > 0);
                });
            });
            it("should lint text as ext( of path )", function() {
                const engine = new TextLintEngine({ rulePaths: [rulesDir] });
                return engine.executeOnText("text", "index.md").then(results => {
                    assert(Array.isArray(results));
                    const lintResult = results[0];
                    assert(lintResult.filePath === "<markdown>");
                    assert(Array.isArray(lintResult.messages));
                    assert(lintResult.messages.length > 0);
                });
            });
        });
    });
    describe("formatResults", function() {
        context("when use default formatter", function() {
            it("should format results and return formatted text", function() {
                const engine = new TextLintEngine({ rulePaths: [rulesDir] });
                return engine.executeOnText("text").then(results => {
                    const output = engine.formatResults(results);
                    assert(/<text>/.test(output));
                    assert(/problem/.test(output));
                });
            });
        });
        context("when loaded custom formatter", function() {
            it("should return custom formatted text", function() {
                const engine = new TextLintEngine({
                    rulePaths: [rulesDir],
                    formatterName: path.join(__dirname, "fixtures/textlint-engine/formatter/example-formatter.js")
                });
                return engine.executeOnText("text").then(results => {
                    const output = engine.formatResults(results);
                    assert(!/<text>/.test(output));
                    assert(/example-formatter/.test(output));
                });
            });
        });
    });
});
