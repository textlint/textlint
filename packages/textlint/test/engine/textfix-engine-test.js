// LICENSE : MIT
"use strict";
const assert = require("power-assert");
const path = require("path");
import {TextFixEngine} from "../../src/";
const rulesDir = path.join(__dirname, "fixtures/textfix-engine/fixer-rules");
const inputTextPath = path.join(__dirname, "fixtures/textfix-engine/fixer-rules", "input.md");
const formatterPath = path.join(__dirname, "fixtures/textfix-engine/formatter/example-fixer-formatter.js");

describe("textfix-engine", function () {
    describe("Constructor", function () {
        context("when no-args", function () {
            it("config should be empty", function () {
                const engine = new TextFixEngine();
                assert.deepEqual(engine.config.rulePaths, []);
            });
        });
        context("when args is object", function () {
            it("should convert the object and set config", function () {
                const engine = new TextFixEngine({
                    rulePaths: [rulesDir]
                });
                assert.deepEqual(engine.config.rulePaths, [rulesDir]);
            });
        });
        context("when args is Config object", function () {
            it("should set directory to config", function () {
                // Issue : when use Config as argus, have to export `../src/config/config`
                var Config = require("../../src/config/config");
                var config = new Config({
                    rulePaths: [rulesDir]
                });
                const engine = new TextFixEngine(config);
                assert.deepEqual(engine.config.rulePaths, [rulesDir]);
            });
        });
    });
    describe("executeOnFiles", function () {
        it("should return FixCommand result", function () {
            const engine = new TextFixEngine({
                rulePaths: [rulesDir]
            });
            var filePath = inputTextPath;
            return engine.executeOnFiles([filePath]).then(results => {
                assert(Array.isArray(results));
                var fileResult = results[0];
                assert(fileResult.filePath === filePath);
                assert(Array.isArray(fileResult.applyingMessages));
                assert(Array.isArray(fileResult.remainingMessages));
                assert(fileResult.output.length > 0);
            });
        });
        context("when process file that has un-available ext ", function () {
            it("should return empty results ", function () {
                const engine = new TextFixEngine();
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
            const engine = new TextFixEngine({
                rulePaths: [rulesDir]
            });
            return engine.executeOnText("text").then(results => {
                assert(Array.isArray(results));
                var lintResult = results[0];
                assert(lintResult.filePath === "<text>");
                assert(Array.isArray(lintResult.applyingMessages));
                assert(Array.isArray(lintResult.remainingMessages));
                assert(lintResult.applyingMessages.length > 0);
                assert(lintResult.remainingMessages.length === 0);
            });
        });
        context("when specify ext", function () {
            it("should lint text as ext", function () {
                const engine = new TextFixEngine({
                    rulePaths: [rulesDir]
                });
                return engine.executeOnText("text", ".md").then(results => {
                    assert(Array.isArray(results));
                    const lintResult = results[0];
                    assert(lintResult.filePath === "<markdown>");
                    assert(Array.isArray(lintResult.applyingMessages));
                    assert(Array.isArray(lintResult.remainingMessages));
                    assert(lintResult.applyingMessages.length > 0);
                    assert(lintResult.remainingMessages.length === 0);
                });
            });
            it("should lint text as ext( of path )", function () {
                const engine = new TextFixEngine({
                    rulePaths: [rulesDir]
                });
                return engine.executeOnText("text", "index.md").then(results => {
                    assert(Array.isArray(results));
                    const lintResult = results[0];
                    assert(lintResult.filePath === "<markdown>");
                    assert(Array.isArray(lintResult.applyingMessages));
                    assert(Array.isArray(lintResult.remainingMessages));
                    assert(lintResult.applyingMessages.length > 0);
                    assert(lintResult.remainingMessages.length === 0);
                });
            });
        });
    });
    describe("formatResults", function () {
        context("when use default formatter is compat", function () {
            it("should format results and return formatted text", function () {
                const engine = new TextFixEngine({
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
                const engine = new TextFixEngine({
                    rulePaths: [rulesDir],
                    formatterName: formatterPath
                });
                return engine.executeOnText("text").then(results => {
                    const output = engine.formatResults(results);
                    assert(!/<text>/.test(output));
                    assert(/example-fixer-formatter/.test(output));
                });
            });
        });
    });
});

