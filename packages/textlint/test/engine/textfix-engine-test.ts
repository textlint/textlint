// LICENSE : MIT
"use strict";
const assert = require("assert");
const path = require("path");
import { TextFixEngine } from "../../src/";
import { Config } from "../../src/config/config";

const rulesDir = path.join(__dirname, "fixtures/textfix-engine/fixer-rules");
const inputTextPath = path.join(__dirname, "fixtures/textfix-engine/fixer-rules", "input.md");
const formatterPath = path.join(__dirname, "fixtures/textfix-engine/formatter/example-fixer-formatter.ts");

describe("textfix-engine", function () {
    describe("Constructor", function () {
        context("when no-args", function () {
            it("config should be empty", function () {
                const engine = new TextFixEngine();
                assert.deepEqual((engine as any).config.rulePaths, []);
            });
        });
        context("when args is object", function () {
            it("should convert the object and set config", function () {
                const engine = new TextFixEngine({ rulePaths: [rulesDir] });
                assert.deepEqual((engine as any).config.rulePaths, [rulesDir]);
            });
        });
        context("when args is Config object", function () {
            it("should set directory to config", function () {
                // Issue : when use Config as argus, have to export `../src/config/config`
                var config = new Config({ rulePaths: [rulesDir] });
                const engine = new TextFixEngine(config);
                assert.deepEqual((engine as any).config.rulePaths, [rulesDir]);
            });
        });
    });
    describe("executeOnFiles", function () {
        it("should return FixCommand result", function () {
            const engine = new TextFixEngine({ rulePaths: [rulesDir] });
            var filePath = inputTextPath;
            return engine.executeOnFiles([filePath]).then((results) => {
                assert.ok(Array.isArray(results));
                var fileResult = results[0];
                assert.ok(fileResult.filePath === filePath);
                assert.ok(Array.isArray(fileResult.applyingMessages));
                assert.ok(Array.isArray(fileResult.remainingMessages));
                assert.ok(fileResult.output.length > 0);
            });
        });
        context("when process file that has un-available ext ", function () {
            it("should return empty results ", function () {
                const engine = new TextFixEngine();
                const filePath = path.join(__dirname, "fixtures/test.unknown");
                return engine.executeOnFiles([filePath]).then((results) => {
                    assert.ok(Array.isArray(results));
                    assert.ok(results.length === 0);
                });
            });
        });
    });
    describe("executeOnText", function () {
        it("should lint a text and return results", function () {
            const engine = new TextFixEngine({ rulePaths: [rulesDir] });
            return engine.executeOnText("text").then((results) => {
                assert.ok(Array.isArray(results));
                var lintResult = results[0];
                assert.ok(lintResult.filePath === "<text>");
                assert.ok(Array.isArray(lintResult.applyingMessages));
                assert.ok(Array.isArray(lintResult.remainingMessages));
                assert.ok(lintResult.applyingMessages.length > 0);
                assert.ok(lintResult.remainingMessages.length === 0);
            });
        });
        context("when specify ext", function () {
            it("should lint text as ext", function () {
                const engine = new TextFixEngine({ rulePaths: [rulesDir] });
                return engine.executeOnText("text", ".md").then((results) => {
                    assert.ok(Array.isArray(results));
                    const lintResult = results[0];
                    assert.ok(lintResult.filePath === "<markdown>");
                    assert.ok(Array.isArray(lintResult.applyingMessages));
                    assert.ok(Array.isArray(lintResult.remainingMessages));
                    assert.ok(lintResult.applyingMessages.length > 0);
                    assert.ok(lintResult.remainingMessages.length === 0);
                });
            });
            it("should lint text as ext( of path )", function () {
                const engine = new TextFixEngine({ rulePaths: [rulesDir] });
                return engine.executeOnText("text", "index.md").then((results) => {
                    assert.ok(Array.isArray(results));
                    const lintResult = results[0];
                    assert.ok(lintResult.filePath === "<markdown>");
                    assert.ok(Array.isArray(lintResult.applyingMessages));
                    assert.ok(Array.isArray(lintResult.remainingMessages));
                    assert.ok(lintResult.applyingMessages.length > 0);
                    assert.ok(lintResult.remainingMessages.length === 0);
                });
            });
        });
    });
    describe("formatResults", function () {
        context("when use default formatter is compat", function () {
            it("should format results and return formatted text", async function () {
                const engine = new TextFixEngine({ rulePaths: [rulesDir] });
                const results = await engine.executeOnText("text");
                const output = await engine.formatResults(results);
                assert.ok(/<text>/.test(output));
                assert.ok(/problem/.test(output));
            });
        });
        context("when loaded custom formatter", function () {
            it("should return custom formatted text", async function () {
                const engine = new TextFixEngine({ rulePaths: [rulesDir], formatterName: formatterPath });
                const results = await engine.executeOnText("text");
                const output = await engine.formatResults(results);
                assert.ok(!/<text>/.test(output));
                assert.ok(/example-fixer-formatter/.test(output));
            });
        });
    });
});
