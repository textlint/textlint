// LICENSE : MIT
"use strict";
import * as assert from "assert";
import { cli } from "../../src/index";
import * as path from "path";
import * as childProcess from "child_process";
import { Logger } from "../../src/util/logger";

const originLog = Logger.log;
describe("cli-test", function() {
    beforeEach(function() {
        Logger.log = function mockLog() {
            // mock console API
        };
    });
    afterEach(function() {
        Logger.log = originLog;
    });
    context("when pass linting", function() {
        it("should output checkstyle xml if the results length is 0", function() {
            let isCalled = false;
            const messages: any[] = [];
            Logger.log = function mockLog(message) {
                isCalled = true;
                messages.push(message);
            };
            const targetFile = path.join(__dirname, "fixtures/test.md");
            const ruleModuleName = "textlint-rule-no-todo";
            return cli.execute(`-f checkstyle --rule ${ruleModuleName} ${targetFile}`).then(() => {
                assert.ok(isCalled, "checkstyle should always output xml");
                assert.ok(messages.length > 0, "should output if empty results");
            });
        });
    });
    context("when fail linting", function() {
        it("should return error when text with incorrect quotes is passed as argument", function() {
            const ruleDir = path.join(__dirname, "fixtures/rules");
            return cli.execute(`--rulesdir ${ruleDir}`, "text").then(result => {
                assert.equal(result, 1);
            });
        });
        it("should return error", function() {
            const ruleDir = path.join(__dirname, "fixtures/rules");
            const targetFile = path.join(__dirname, "fixtures/test.md");
            return cli.execute(`--rulesdir ${ruleDir} ${targetFile}`).then(result => {
                assert.equal(result, 1);
            });
        });
        it("should return an error when use no-todo rules is specified", function() {
            cli.execute("", "text").then(result => {
                assert.equal(result, 1);
            });
        });
        it("should return 1 (error)", function() {
            const targetFile = path.join(__dirname, "fixtures/test.md");
            return cli.execute(`${targetFile}`).then(result => {
                assert.equal(result, 1);
            });
        });
        it("should report lint warning and error by using stylish reporter", function() {
            const targetFile = path.join(__dirname, "fixtures/todo.md");
            const configFile = path.join(__dirname, "fixtures/.textlintrc.json");
            Logger.log = function mockLog(message) {
                const json = JSON.parse(message);
                assert.deepStrictEqual(json, [
                    {
                        filePath: targetFile,
                        messages: [
                            {
                                column: 3,
                                index: 17,
                                line: 3,
                                message: "Found TODO: '- [ ] TODO'",
                                ruleId: "no-todo",
                                severity: 1,
                                type: "lint"
                            }
                        ]
                    }
                ]);
            };
            return cli.execute(`${targetFile} -f json --config ${configFile}`).then(result => {
                assert.equal(result, 0);
            });
        });
    });
    context("When run with --rule", function() {
        it("should lint the file with long name", function(done) {
            let isCalled = false;
            Logger.log = function mockLog(message) {
                isCalled = true;
                assert.ok(message.length > 0);
            };
            const targetFile = path.join(__dirname, "fixtures/test.md");
            const ruleModuleName = "textlint-rule-no-todo";
            cli.execute(`${targetFile} --rule ${ruleModuleName}`).then(result => {
                assert.equal(result, 0);
                assert.ok(!isCalled);
                done();
            });
        });
        it("should lint the file with short name", function(done) {
            let isCalled = false;
            Logger.log = function mockLog(message) {
                isCalled = true;
                assert.ok(message.length > 0);
            };
            const targetFile = path.join(__dirname, "fixtures/test.md");
            const ruleModuleName = "no-todo";
            cli.execute(`${targetFile} --rule ${ruleModuleName}`).then(result => {
                assert.equal(result, 0);
                assert.ok(!isCalled);
                done();
            });
        });
    });
    context("When run with --preset", function() {
        it("should lint the file with long name", function(done) {
            let isCalled = false;
            Logger.log = function mockLog(message) {
                isCalled = true;
                assert.ok(message.length > 0);
            };
            const targetFile = path.join(__dirname, "fixtures/test.md");
            const ruleModuleName = "textlint-rule-preset-jtf-style";
            cli.execute(`${targetFile} --preset ${ruleModuleName}`).then(result => {
                assert.equal(result, 0);
                assert.ok(!isCalled);
                done();
            });
        });
        it("should lint the file with middle name", function(done) {
            let isCalled = false;
            Logger.log = function mockLog(message) {
                isCalled = true;
                assert.ok(message.length > 0);
            };
            const targetFile = path.join(__dirname, "fixtures/test.md");
            const ruleModuleName = "preset-jtf-style";
            cli.execute(`${targetFile} --preset ${ruleModuleName}`).then(result => {
                assert.equal(result, 0);
                assert.ok(!isCalled);
                done();
            });
        });
        it("should lint the file with long name", function(done) {
            let isCalled = false;
            Logger.log = function mockLog(message) {
                isCalled = true;
                assert.ok(message.length > 0);
            };
            const targetFile = path.join(__dirname, "fixtures/test.md");
            const ruleModuleName = "jtf-style";
            cli.execute(`${targetFile} --preset ${ruleModuleName}`).then(result => {
                assert.equal(result, 0);
                assert.ok(!isCalled);
                done();
            });
        });
    });

    context("When run with --plugin", function() {
        it("should lint the file with long name", function() {
            let isCalled = false;
            Logger.log = function mockLog(message) {
                isCalled = true;
                assert.ok(message.length > 0);
            };
            const targetFile = path.join(__dirname, "fixtures/todo.html");
            const longName = "textlint-plugin-html";
            const ruleModuleName = "no-todo";
            return cli.execute(`${targetFile} --plugin ${longName} --rule ${ruleModuleName}`).then(result => {
                assert.equal(result, 1);
                assert.ok(isCalled);
            });
        });
        it("should lint the file with long name", function() {
            let isCalled = false;
            Logger.log = function mockLog(message) {
                isCalled = true;
                assert.ok(message.length > 0);
            };
            const targetFile = path.join(__dirname, "fixtures/todo.html");
            const shortName = "html";
            const ruleModuleName = "no-todo";
            return cli.execute(`${targetFile} --plugin ${shortName} --rule ${ruleModuleName}`).then(result => {
                assert.equal(result, 1);
                assert.ok(isCalled);
            });
        });

        it("should lint and correct error", function() {
            let isCalled = false;
            Logger.log = function mockLog(message) {
                isCalled = true;
                assert.ok(message.length > 0);
            };
            const targetFile = path.join(__dirname, "fixtures/todo.html");
            const shortName = "html";
            const ruleModuleName = "no-todo";
            return cli.execute(`${targetFile} --plugin ${shortName} --rule ${ruleModuleName}`).then(result => {
                assert.ok(isCalled);
                assert.equal(result, 1);
            });
        });
        it("when not error, status is 0", function() {
            let isCalled = false;
            Logger.log = function mockLog() {
                isCalled = true;
            };
            const targetFile = path.join(__dirname, "fixtures/pass.html");
            const shortName = "html";
            const ruleModuleName = "no-todo";
            return cli.execute(`${targetFile} --plugin ${shortName} --rule ${ruleModuleName}`).then(result => {
                assert.ok(!isCalled);
                assert.equal(result, 0);
            });
        });
    });
    context("When run with --fix", function() {
        context("when not rules found", function() {
            it("show suggestion message from FAQ", function() {
                let isCalled = false;
                Logger.log = function mockLog(message) {
                    isCalled = true;
                    assert.ok(message.length > 0);
                };
                const targetFile = path.join(__dirname, "fixtures/test.md");
                return cli.execute(`${targetFile} --fix`).then(result => {
                    assert.equal(result, 1);
                    assert.ok(isCalled);
                });
            });
        });
        context("when has rule", function() {
            it("should execute fixer", function() {
                const ruleDir = path.join(__dirname, "fixtures/fixer-rules");
                const targetFile = path.join(__dirname, "fixtures/test.md");
                return cli.execute(`--rulesdir ${ruleDir} --fix ${targetFile}`).then(result => {
                    assert.equal(result, 0);
                });
            });
        });
    });
    context("When run with --quiet", function() {
        it("shows only errors, not warnings", function() {
            let isCalled = false;
            Logger.log = function mockLog() {
                isCalled = true;
            };
            const targetFile = path.join(__dirname, "fixtures/todo.html");
            const configFile = path.join(__dirname, "fixtures/quite.textlintrc.json");
            return cli.execute(`${targetFile} -c ${configFile} --quiet ${targetFile}`).then(result => {
                assert.equal(result, 0);
                assert.ok(!isCalled);
            });
        });
    });
    context("When no rules found", function() {
        it("show suggestion message from FAQ", function() {
            Logger.log = function mockLog(message) {
                assert.ok(message.length > 0);
            };
            const targetFile = path.join(__dirname, "fixtures/test.md");
            return cli.execute(`${targetFile}`).then(result => {
                assert.equal(result, 1);
            });
        });
    });
    describe("--version", function() {
        it("should output current textlint version", function() {
            const pkg = require("../../package");
            Logger.log = function mockLog(message) {
                assert.equal(message, `v${pkg.version}`);
            };
            return cli.execute("--version").then(exitCode => {
                assert.strictEqual(exitCode, 0);
            });
        });
    });
    describe("--help", function() {
        it("should output expected help message", function() {
            Logger.log = function mockLog(message) {
                assert.notEqual(message.indexOf("Show help"), -1);
            };
            return cli.execute("--help").then(exitCode => {
                assert.strictEqual(exitCode, 0);
            });
        });
    });
    // Regression testing
    // (node) warning: possible EventEmitter memory leak detected. 11 Str listeners added. Use emitter.setMaxListeners() to increase limit.
    describe("EventEmitter memory leak detected", function() {
        xit("should not show in console", function() {
            // testing stderr https://github.com/nodejs/node/blob/082cc8d6d8f5c7c797e58cefeb475b783c730635/test/parallel/test-util-internal.js#L53-L59
            const targetFile = path.join(__dirname, "fixtures/test.md");
            const bin = path.join(__dirname, "../../bin/textlint.js");
            const args = ["--preset", "textlint-rule-preset-jtf-style", `${targetFile}`];
            const result = childProcess.spawnSync(`${bin}`, args, { encoding: "utf8" });
            assert.strictEqual(result.stderr.indexOf("memory leak detected"), -1);
        });
    });
});
