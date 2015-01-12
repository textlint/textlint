// LICENSE : MIT
"use strict";
var assert = require("power-assert");
var CLIEngine = require("../").CLIEngine;
var rulesDir = __dirname + "/fixtures/rules";
var path = require("path");
describe("cli-engine-test", function () {
    var cliEngine;
    describe("executeOnFiles", function () {
        beforeEach(function () {
            cliEngine = new CLIEngine({
                rulesdir: [rulesDir]
            });
        });
        it("should found error message", function () {
            var filePath = require("path").join(__dirname, "fixtures/test.md");
            var results = cliEngine.executeOnFiles([filePath]);
            assert(Array.isArray(results));
            var fileResult = results[0];
            assert(fileResult.filePath === filePath);
            assert(Array.isArray(fileResult.messages));
            assert(fileResult.messages.length > 0);
        });
    });
    describe("executeOnText", function () {
        beforeEach(function () {
            cliEngine = new CLIEngine({
                rulesdir: [rulesDir]
            });
        });
        it("should lint a text and return results", function () {
            var results = cliEngine.executeOnText("text");
            assert(Array.isArray(results));
            var lintResult = results[0];
            assert(lintResult.filePath === "<text>");
            assert(Array.isArray(lintResult.messages));
            assert(lintResult.messages.length > 0);
        });
    });
    describe("formatResults", function () {
        context("when use default formatter", function () {
            beforeEach(function () {
                cliEngine = new CLIEngine({
                    rulesdir: [rulesDir]
                });
            });
            it("should format results and return formatted text", function () {
                var results = cliEngine.executeOnText("text");
                var output = cliEngine.formatResults(results);
                assert(/<text>/.test(output));
                assert(/problems/.test(output));
            });
        });
        context("when loaded custom formatter", function () {
            beforeEach(function () {
                cliEngine = new CLIEngine({
                    rulesdir: [rulesDir],
                    format: path.join(__dirname, "fixtures/formatter/example-formatter.js")
                });
            });
            it("should return custom formatted text", function () {
                var results = cliEngine.executeOnText("text");
                var output = cliEngine.formatResults(results);
                assert(!/<text>/.test(output));
                assert(/example-formatter/.test(output));
            });
        })
    });
});