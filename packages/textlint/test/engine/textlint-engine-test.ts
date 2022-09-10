// LICENSE : MIT
"use strict";
import { TextlintKernelDescriptor } from "@textlint/kernel";
import { TextLintEngine } from "../../src/";
import { Config } from "../../src/config/config";
import assert from "assert";
import path from "path";

const rulesDir = path.join(__dirname, "fixtures/textlint-engine/rules");
const pluginsDir = path.join(__dirname, "fixtures/textlint-engine/plugins");
const presetsDir = path.join(__dirname, "fixtures/textlint-engine/presets");

const getRuleDescriptor = (descriptor: TextlintKernelDescriptor, ruleName: string) => {
    const ruleAllRuleDescriptor = descriptor.rule.allDescriptors.find(
        (ruleDescriptor) => ruleDescriptor.id === ruleName
    );
    return ruleAllRuleDescriptor && ruleAllRuleDescriptor;
};
const getRule = (descriptor: TextlintKernelDescriptor, ruleName: string) => {
    const ruleAllRuleDescriptor = getRuleDescriptor(descriptor, ruleName);
    return ruleAllRuleDescriptor && ruleAllRuleDescriptor.rule;
};
const getRuleNames = (descriptor: TextlintKernelDescriptor) => {
    return descriptor.rule.allDescriptors.map((ruleDescriptor) => ruleDescriptor.id);
};

describe("textlint-engine-test", function () {
    describe("Constructor", function () {
        context("when no-args", function () {
            it("config should be empty", function () {
                const engine = new TextLintEngine();
                assert.deepEqual((engine as any).config.rulePaths, []);
            });
        });
        context("when args is object", function () {
            it("should convert the object and set config", function () {
                const engine = new TextLintEngine({ rulePaths: [rulesDir] });
                assert.deepEqual((engine as any).config.rulePaths, [rulesDir]);
            });
        });
        context("when args is Config object", function () {
            it("should set directory to config", function () {
                // Issue : when use Config as arguments, have to export `../src/config/config`
                const config = new Config({ rulePaths: [rulesDir] });
                const engine = new TextLintEngine(config);
                assert.deepEqual((engine as any).config.rulePaths, [rulesDir]);
            });
        });
    });
    describe("setup rule", function () {
        context("when rule is a scoped module", function () {
            it("should define rule", async function () {
                const engine = new TextLintEngine({
                    rules: ["@textlint/textlint-rule-example"],
                    rulesBaseDirectory: rulesDir
                });
                const ruleNames = getRuleNames(await engine.getInternalTextlintrcDescriptor());
                assert.strictEqual(ruleNames.length, 1);
                const ruleName = ruleNames[0];
                assert.strictEqual(ruleName, "@textlint/example");
                assert.strictEqual(
                    typeof getRule(await engine.getInternalTextlintrcDescriptor(), ruleName),
                    "function"
                );
            });
        });
        context("when (textlint-rule-)no-todo is specified", function () {
            it("should set `no-todo` as key to rule dict", async function () {
                const engine = new TextLintEngine({ rules: ["no-todo"] });
                const ruleNames = getRuleNames(await engine.getInternalTextlintrcDescriptor());
                assert.ok(ruleNames.length > 0);
                assert.equal(ruleNames[0], "no-todo");
            });
        });
        context("when textlint-rule-no-todo is specified", function () {
            it("should set `no-todo` as key to rule dict", async function () {
                const engine = new TextLintEngine({ rules: ["textlint-rule-no-todo"] });
                const ruleNames = getRuleNames(await engine.getInternalTextlintrcDescriptor());
                assert.ok(ruleNames.length > 0);
                assert.equal(ruleNames[0], "no-todo");
            });
        });
    });
    describe("#loadPlugin", function () {
        context("when Plugin has rules", function () {
            it("should throw Error", function () {
                return assert.rejects(async () => {
                    const engine = new TextLintEngine({ rulesBaseDirectory: pluginsDir, plugins: ["invalid"] });
                    await engine.getInternalTextlintrcDescriptor();
                }, Error);
            });
        });
        context("when Processor Plugin is a scoped module", function () {
            it("should define processor of plugin", async function () {
                const engine = new TextLintEngine({ plugins: ["html"] });
                assert.ok((await engine.getInternalTextlintrcDescriptor()).plugin.descriptors.length > 0);
            });
        });
        context("when Plugin has not rules", function () {
            it("should not throw Error", async function () {
                const engine = new TextLintEngine({ plugins: ["@textlint/markdown"] });
                const ruleNames = getRuleNames(await engine.getInternalTextlintrcDescriptor());
                assert.ok(ruleNames.length === 0);
            });
        });
    });

    describe("#loadPreset", function () {
        context("when preset is a scoped module", function () {
            it("should define rule of preset", async function () {
                const engine = new TextLintEngine({
                    presets: ["@textlint/textlint-rule-preset-example"],
                    rulesBaseDirectory: presetsDir
                });
                const ruleNames = getRuleNames(await engine.getInternalTextlintrcDescriptor());
                assert.strictEqual(ruleNames.length, 1);
                const ruleName = ruleNames[0];
                assert.strictEqual(ruleName, "@textlint/example/example-rule");
                assert.strictEqual(
                    typeof getRule(await engine.getInternalTextlintrcDescriptor(), ruleName),
                    "function"
                );
            });
        });
        context("when the rule is **not** defined", function () {
            it("should define rules of preset", async function () {
                const engine = new TextLintEngine({ presets: ["example"], rulesBaseDirectory: presetsDir });
                const ruleNames = getRuleNames(await engine.getInternalTextlintrcDescriptor());
                assert.ok(ruleNames.length === 2);
                assert.strictEqual(ruleNames[0], "example/a");
                assert.strictEqual(ruleNames[1], "example/b");
            });
        });
    });

    describe("executeOnFiles", function () {
        it("should found error message", function () {
            const engine = new TextLintEngine({ rulePaths: [rulesDir] });
            const filePath = path.join(__dirname, "fixtures/test.md");
            return engine.executeOnFiles([filePath]).then((results) => {
                assert.ok(Array.isArray(results));
                const fileResult = results[0];
                assert.ok(fileResult.filePath === filePath);
                assert.ok(Array.isArray(fileResult.messages));
                assert.ok(fileResult.messages.length > 0);
            });
        });
        context("when process file that has un-available ext ", function () {
            it("should return empty results ", function () {
                const engine = new TextLintEngine();
                const filePath = path.join(__dirname, "fixtures/test.unknown");
                return engine.executeOnFiles([filePath]).then((results) => {
                    assert.ok(Array.isArray(results));
                    assert.ok(results.length === 0);
                });
            });
        });
        context("when specify `ignoreFile` option", function () {
            it("should ignore file described in the ignore file", function () {
                const ignoreFilePath = path.join(__dirname, "fixtures/.textlintignore");
                const engine = new TextLintEngine({ rulePaths: [rulesDir], ignoreFile: ignoreFilePath });
                const filePath = path.join(__dirname, "fixtures/*.md");
                return engine.executeOnFiles([filePath]).then((results) => {
                    assert.ok(Array.isArray(results));
                    assert.ok(results.length > 0);
                    assert.ok(
                        results.every((result) => {
                            return result.filePath !== path.join(__dirname, "fixtures/ignored.md");
                        })
                    );
                });
            });
        });
    });
    describe("executeOnText", function () {
        it("should lint a text and return results", function () {
            const engine = new TextLintEngine({ rulePaths: [rulesDir] });
            return engine.executeOnText("text").then((results) => {
                assert.ok(Array.isArray(results));
                const lintResult = results[0];
                assert.ok(lintResult.filePath === "<text>");
                assert.ok(Array.isArray(lintResult.messages));
                assert.ok(lintResult.messages.length > 0);
            });
        });
        context("when specify ext", function () {
            it("should lint text as ext", function () {
                const engine = new TextLintEngine({ rulePaths: [rulesDir] });
                return engine.executeOnText("text", ".md").then((results) => {
                    assert.ok(Array.isArray(results));
                    const lintResult = results[0];
                    assert.ok(lintResult.filePath === "<markdown>");
                    assert.ok(Array.isArray(lintResult.messages));
                    assert.ok(lintResult.messages.length > 0);
                });
            });
            it("should lint text as ext( of path )", function () {
                const engine = new TextLintEngine({ rulePaths: [rulesDir] });
                return engine.executeOnText("text", "index.md").then((results) => {
                    assert.ok(Array.isArray(results));
                    const lintResult = results[0];
                    assert.ok(lintResult.filePath === "<markdown>");
                    assert.ok(Array.isArray(lintResult.messages));
                    assert.ok(lintResult.messages.length > 0);
                });
            });
        });
    });
    describe("formatResults", function () {
        context("when use default formatter", function () {
            it("should format results and return formatted text", async function () {
                const engine = new TextLintEngine({ rulePaths: [rulesDir] });
                const results = await engine.executeOnText("text");
                const output = await engine.formatResults(results);
                assert.ok(/<text>/.test(output));
                assert.ok(/problem/.test(output));
            });
        });
        context("when loaded custom formatter", function () {
            it("should return custom formatted text", async function () {
                const engine = new TextLintEngine({
                    rulePaths: [rulesDir],
                    formatterName: path.join(__dirname, "fixtures/textlint-engine/formatter/example-formatter.ts")
                });
                const results = await engine.executeOnText("text");
                const output = await engine.formatResults(results);
                assert.ok(!/<text>/.test(output));
                assert.ok(/example-formatter/.test(output));
            });
        });
    });
});
