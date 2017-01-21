// LICENSE : MIT
"use strict";
const assert = require("power-assert");
const cli = require("../../src/index").cli;
const path = require("path");
const spawnSync = require("child_process").spawnSync;
import Logger from "../../src/util/logger";
const originLog = Logger.log;
describe("cli-test", function () {
    beforeEach(function () {
        Logger.log = function mockLog() {
            // mock console API
        };
    });
    afterEach(function () {
        Logger.log = originLog;
    });
    context("when pass linting", function () {
        it("should return error when text with incorrect quotes is passed as argument", function () {
            var ruleDir = path.join(__dirname, "fixtures/rules");
            return cli.execute("--rulesdir " + ruleDir, "text").then(result => {
                assert.equal(result, 1);
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
    context("When run with --rule", function () {
        it("should lint the file with long name", function (done) {
            let isCalled = false;
            Logger.log = function mockLog(message) {
                isCalled = true;
                assert(message.length > 0);
            };
            const targetFile = path.join(__dirname, "fixtures/test.md");
            const ruleModuleName = "textlint-rule-no-todo";
            cli.execute(`${targetFile} --rule ${ruleModuleName}`).then(result => {
                assert.equal(result, 0);
                assert(!isCalled);
                done();
            });
        });
        it("should lint the file with short name", function (done) {
            let isCalled = false;
            Logger.log = function mockLog(message) {
                isCalled = true;
                assert(message.length > 0);
            };
            const targetFile = path.join(__dirname, "fixtures/test.md");
            const ruleModuleName = "no-todo";
            cli.execute(`${targetFile} --rule ${ruleModuleName}`).then(result => {
                assert.equal(result, 0);
                assert(!isCalled);
                done();
            });
        });
    });
    context("When run with --preset", function () {
        it("should lint the file with long name", function (done) {
            let isCalled = false;
            Logger.log = function mockLog(message) {
                isCalled = true;
                assert(message.length > 0);
            };
            const targetFile = path.join(__dirname, "fixtures/test.md");
            const ruleModuleName = "textlint-rule-preset-jtf-style";
            cli.execute(`${targetFile} --preset ${ruleModuleName}`).then(result => {
                assert.equal(result, 0);
                assert(!isCalled);
                done();
            });
        });
        it("should lint the file with middle name", function (done) {
            let isCalled = false;
            Logger.log = function mockLog(message) {
                isCalled = true;
                assert(message.length > 0);
            };
            const targetFile = path.join(__dirname, "fixtures/test.md");
            const ruleModuleName = "preset-jtf-style";
            cli.execute(`${targetFile} --preset ${ruleModuleName}`).then(result => {
                assert.equal(result, 0);
                assert(!isCalled);
                done();
            });
        });
        it("should lint the file with long name", function (done) {
            let isCalled = false;
            Logger.log = function mockLog(message) {
                isCalled = true;
                assert(message.length > 0);
            };
            const targetFile = path.join(__dirname, "fixtures/test.md");
            const ruleModuleName = "jtf-style";
            cli.execute(`${targetFile} --preset ${ruleModuleName}`).then(result => {
                assert.equal(result, 0);
                assert(!isCalled);
                done();
            });
        });
    });

    context("When run with --plugin", function () {
        it("should lint the file with long name", function () {
            let isCalled = false;
            Logger.log = function mockLog(message) {
                isCalled = true;
                assert(message.length > 0);
            };
            const targetFile = path.join(__dirname, "fixtures/todo.html");
            const longName = "textlint-plugin-html";
            const ruleModuleName = "no-todo";
            return cli.execute(`${targetFile} --plugin ${longName} --rule ${ruleModuleName}`).then(result => {
                assert.equal(result, 1);
                assert(isCalled);
            });
        });
        it("should lint the file with long name", function () {
            let isCalled = false;
            Logger.log = function mockLog(message) {
                isCalled = true;
                assert(message.length > 0);
            };
            const targetFile = path.join(__dirname, "fixtures/todo.html");
            const shortName = "html";
            const ruleModuleName = "no-todo";
            return cli.execute(`${targetFile} --plugin ${shortName} --rule ${ruleModuleName}`).then(result => {
                assert.equal(result, 1);
                assert(isCalled);
            });
        });

        it("should lint and correct error", function () {
            let isCalled = false;
            Logger.log = function mockLog(message) {
                isCalled = true;
                assert(message.length > 0);
            };
            const targetFile = path.join(__dirname, "fixtures/todo.html");
            const shortName = "html";
            const ruleModuleName = "no-todo";
            return cli.execute(`${targetFile} --plugin ${shortName} --rule ${ruleModuleName}`).then(result => {
                assert(isCalled);
                assert.equal(result, 1);
            });
        });
        it("when not error, status is 0", function () {
            let isCalled = false;
            Logger.log = function mockLog() {
                isCalled = true;
            };
            const targetFile = path.join(__dirname, "fixtures/pass.html");
            const shortName = "html";
            const ruleModuleName = "no-todo";
            return cli.execute(`${targetFile} --plugin ${shortName} --rule ${ruleModuleName}`).then(result => {
                assert(!isCalled);
                assert.equal(result, 0);
            });
        });
    });
    context("When run with --fix", function () {
        context("when not set rules", function () {
            it("show suggestion message from FAQ", function () {
                let isCalled = false;
                Logger.log = function mockLog(message) {
                    isCalled = true;
                    assert(message.length > 0);
                };
                const targetFile = path.join(__dirname, "fixtures/test.md");
                return cli.execute(`${targetFile} --fix`).then(result => {
                    assert.equal(result, 0);
                    assert(isCalled);
                });
            });
        });
        context("when has rule", function () {
            it("should execute fixer", function () {
                const ruleDir = path.join(__dirname, "fixtures/fixer-rules");
                const targetFile = path.join(__dirname, "fixtures/test.md");
                return cli.execute(`--rulesdir ${ruleDir} --fix ${targetFile}`).then(result => {
                    assert.equal(result, 0);
                });
            });
        });
    });
    context("When not set rules", function () {
        it("show suggestion message from FAQ", function () {
            Logger.log = function mockLog(message) {
                assert(message.length > 0);
            };
            var targetFile = path.join(__dirname, "fixtures/test.md");
            return cli.execute(`${targetFile}`).then(result => {
                assert.equal(result, 0);
            });
        });
    });
    // Regression testing
    // (node) warning: possible EventEmitter memory leak detected. 11 Str listeners added. Use emitter.setMaxListeners() to increase limit.
    describe("EventEmitter memory leak detected", function () {
        xit("should not show in console", function () {
            // testing stderr https://github.com/nodejs/node/blob/082cc8d6d8f5c7c797e58cefeb475b783c730635/test/parallel/test-util-internal.js#L53-L59
            const targetFile = path.join(__dirname, "fixtures/test.md");
            const bin = path.join(__dirname, "../../bin/textlint.js");
            const args = [
                "--preset",
                "textlint-rule-preset-jtf-style",
                `${targetFile}`
            ];
            const result = spawnSync(`${bin}`, args, {encoding: "utf8"});
            assert.strictEqual(result.stderr.indexOf("memory leak detected"), -1);
        });
    });
});
