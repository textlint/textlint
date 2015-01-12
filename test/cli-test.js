// LICENSE : MIT
"use strict";
var assert = require("power-assert");
var cli = require("../").cli;
var path = require("path");
describe("cli-test", function () {
    context("when pass lint", function () {
        it("should return error when text with incorrect quotes is passed as argument", function () {
            var ruleDir = path.join(__dirname, "fixtures/rules");
            var result = cli.execute("--rulesdir " + ruleDir, "text");
            assert.equal(result, 1);
        });
        it("should return no error when use no-todo rules is specified", function () {
            var result = cli.execute("", "text");
            assert.equal(result, 0);
        });
    });
});