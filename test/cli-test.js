// LICENSE : MIT
"use strict";
const assert = require("power-assert");
const cli = require("../src/").cli;
const path = require("path");
const spawnSync = require('child_process').spawnSync;
describe("cli-test", function () {
    let originLog = console.log;
    before(function () {
        // mock console API
        console.log = function mockLog() {
        };
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
    context(" When not set rules", function () {
        it("show suggestion message from FAQ", function (done) {
            console.log = function mockLog(message) {
                assert(message.length > 0);
            };
            var targetFile = path.join(__dirname, "fixtures/test.md");
            cli.execute(`${targetFile}`).then(result => {
                assert.equal(result, 0);
                done();
            });
        });
    });
    // Regression testing
    // (node) warning: possible EventEmitter memory leak detected. 11 Str listeners added. Use emitter.setMaxListeners() to increase limit.
    describe("EventEmitter memory leak detected", function () {
        it("should not show in console", function () {
            // testing stderr https://github.com/nodejs/node/blob/082cc8d6d8f5c7c797e58cefeb475b783c730635/test/parallel/test-util-internal.js#L53-L59
            const targetFile = path.join(__dirname, "fixtures/test.md");
            const bin = path.join(__dirname, "../bin/textlint.js");
            const args = [
                '--preset',
                'textlint-rule-preset-jtf-style',
                `${targetFile}`
            ];
            const result = spawnSync(`${bin}`, args, {encoding: 'utf8'});
            assert.strictEqual(result.stderr.indexOf('memory leak detected'), -1);
        });
    });
});