// LICENSE : MIT
"use strict";
var assert = require("power-assert");
var CLIEngine = require("../").CLIEngine;
var rulesDir = __dirname + "/rules";
describe("cli-engine-test", function () {
    var cliEngine;
    describe("executeOnFiles", function () {
        it("should found error message", function () {
            cliEngine = new CLIEngine({
                rulesdir: [rulesDir]
            });
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
        it("should lint a text and return results", function () {
            var results = cliEngine.executeOnText("text");
            assert(Array.isArray(results));
            var lintResult = results[0];
            assert(lintResult.filePath === "<text>");
            assert(Array.isArray(lintResult.messages));
            assert(lintResult.messages.length > 0);
        });
    });
});