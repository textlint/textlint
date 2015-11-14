// LICENSE : MIT
"use strict";
var assert = require("power-assert");
var cli = require("../src/").cli;
var path = require("path");
describe("cli-test", function () {
    let originLog = console.log;
    before(function () {
        // mock console API
        console.log = function mockLog() {
        }
    });
    after(function () {
        console.log = originLog;
    });
    context("when pass linting", function () {
        it("should return error when text with incorrect quotes is passed as argument", function () {
            var ruleDir = path.join(__dirname, "fixtures/rules");
            return cli.execute("--rulesdir " + ruleDir, "text").then(result => {
                assert.equal(result, 1)
            });
        });
        it("should return error", function () {
            var ruleDir = path.join(__dirname, "fixtures/rules");
            var targetFile = path.join(__dirname, "fixtures/test.md");
            return cli.execute(`--rulesdir ${ruleDir} ${targetFile}`).then(result => {
                assert.equal(result, 1);
            });
        });
    });
    context("when fail linting", function () {
        it("should return no error when use no-todo rules is specified", function () {
            cli.execute("", "text").then(result => {
                assert.equal(result, 0);
            });
        });
        it("should return 0(no error)", function () {
            var targetFile = path.join(__dirname, "fixtures/test.md");
            return cli.execute(`${targetFile}`).then(result => {
                assert.equal(result, 0);
            });
        });
    });
});