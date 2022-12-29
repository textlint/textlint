// LICENSE : MIT
"use strict";
import * as assert from "assert";
import { cli } from "../../src/cli-new";
import * as path from "path";
import { Logger } from "../../src/util/logger";
import fs from "fs";

type RunContext = {
    getLogs(): string[];
    assertMatchLog(pattern: RegExp): unknown;
    assertNotHasLog(): unknown;
    assertHasLog(): unknown;
};
const originLog = Logger.log;
const runWithMockLog = async (cb: (context: RunContext) => unknown): Promise<unknown> => {
    const originLog = Logger.log;
    const messages: string[] = [];
    Logger.log = function mockLog(message) {
        messages.push(message);
    };
    const context = {
        getLogs() {
            return messages;
        },
        assertMatchLog(pattern: RegExp) {
            assert.match(messages[0], pattern);
        },
        assertHasLog() {
            assert.ok(messages.length > 0, "should have logs");
        },
        assertNotHasLog() {
            assert.ok(messages.length === 0, "should not have logs");
        }
    };
    try {
        await cb(context);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.log("Logs", context.getLogs());
        throw error;
    }
    Logger.log = originLog;
    return;
};
describe("cli-new-test", function () {
    beforeEach(function () {
        Logger.log = function mockLog() {
            // mock console API
        };
    });
    afterEach(function () {
        Logger.log = originLog;
    });
    context("when pass linting", function () {
        it("should output checkstyle xml if the results length is 0", function () {
            return runWithMockLog(({ getLogs }) => {
                const targetFile = path.join(__dirname, "fixtures/test.md");
                const ruleModuleName = "textlint-rule-no-todo";
                return cli.execute(`-f checkstyle --rule ${ruleModuleName} ${targetFile}`).then(() => {
                    assert.ok(
                        getLogs().length > 0,
                        "should output unless empty results because checkstyle is always xml"
                    );
                });
            });
        });
    });
    context("when fail linting", function () {
        it("should return error when text with incorrect quotes is passed as argument", function () {
            return runWithMockLog(async () => {
                const ruleDir = path.join(__dirname, "fixtures/rules");
                const result = await cli.execute(`--rulesdir ${ruleDir} --stdin-filename=test.md`, "text");
                assert.strictEqual(result, 1);
            });
        });
        it("should return error", function () {
            return runWithMockLog(async () => {
                const ruleDir = path.join(__dirname, "fixtures/rules");
                const targetFile = path.join(__dirname, "fixtures/test.md");
                const result = await cli.execute(`--rulesdir ${ruleDir} ${targetFile}`);
                assert.strictEqual(result, 1);
            });
        });
        it("should return an error because No rules found with text", function () {
            return runWithMockLog(async ({ getLogs }) => {
                const result = await cli.execute("--stdin-filename=test.md", "text");
                assert.strictEqual(result, 1);
                assert.match(getLogs()[0], /No rules found/);
            });
        });
        it("should return an error because No rules found with files", function () {
            return runWithMockLog(async ({ getLogs }) => {
                const targetFile = path.join(__dirname, "fixtures/test.md");
                const result = await cli.execute(`${targetFile}`);
                assert.strictEqual(result, 1);
                assert.match(getLogs()[0], /No rules found/);
            });
        });
        it("should report lint warning and error by using stylish reporter", function () {
            return runWithMockLog(async ({ getLogs }) => {
                const targetFile = path.join(__dirname, "fixtures/todo.md");
                const configFile = path.join(__dirname, "fixtures/.textlintrc.json");
                const result = await cli.execute(`${targetFile} -f json --config ${configFile}`);
                assert.strictEqual(result, 0);
                const [message] = getLogs();
                const json = JSON.parse(message);
                assert.deepStrictEqual(json, [
                    {
                        filePath: targetFile,
                        messages: [
                            {
                                column: 3,
                                index: 17,
                                line: 3,
                                loc: {
                                    start: {
                                        column: 3,
                                        line: 3
                                    },
                                    end: {
                                        column: 4,
                                        line: 3
                                    }
                                },
                                range: [17, 18],
                                message: "Found TODO: '- [ ] TODO'",
                                ruleId: "textlint-rule-no-todo",
                                severity: 1,
                                type: "lint"
                            }
                        ]
                    }
                ]);
            });
        });
    });
    context("When run with --rule", function () {
        it("should lint the file with long name", function () {
            return runWithMockLog(async ({ assertNotHasLog }) => {
                const targetFile = path.join(__dirname, "fixtures/test.md");
                const ruleModuleName = "textlint-rule-no-todo";
                const result = await cli.execute(`${targetFile} --rule ${ruleModuleName}`);
                assert.strictEqual(result, 0);
                assertNotHasLog();
            });
        });
        it("should lint the file with short name", function () {
            return runWithMockLog(async ({ assertNotHasLog }) => {
                const targetFile = path.join(__dirname, "fixtures/test.md");
                const ruleModuleName = "no-todo";
                const result = await cli.execute(`${targetFile} --rule ${ruleModuleName}`);
                assert.strictEqual(result, 0);
                assertNotHasLog();
            });
        });
    });
    context("When run with --preset", function () {
        it("should lint the file with full name", function () {
            return runWithMockLog(async ({ assertNotHasLog }) => {
                const targetFile = path.join(__dirname, "fixtures/test.md");
                const ruleModuleName = "textlint-rule-preset-jtf-style";
                const result = await cli.execute(`${targetFile} --preset ${ruleModuleName}`);
                assert.strictEqual(result, 0);
                assertNotHasLog();
            });
        });
        it("should lint the file with preset-prefix name", function () {
            return runWithMockLog(async ({ assertNotHasLog }) => {
                const targetFile = path.join(__dirname, "fixtures/test.md");
                const ruleModuleName = "preset-jtf-style";
                const result = await cli.execute(`${targetFile} --preset ${ruleModuleName}`);
                assert.strictEqual(result, 0);
                assertNotHasLog();
            });
        });
        it("should lint the file with without prefix name", function () {
            return runWithMockLog(async ({ assertNotHasLog }) => {
                const targetFile = path.join(__dirname, "fixtures/test.md");
                const ruleModuleName = "jtf-style";
                const result = await cli.execute(`${targetFile} --preset ${ruleModuleName}`);
                assert.strictEqual(result, 0);
                assertNotHasLog();
            });
        });
    });

    context("When run with --plugin", function () {
        it("should lint the file with full name", function () {
            return runWithMockLog(async ({ assertHasLog }) => {
                const targetFile = path.join(__dirname, "fixtures/todo.html");
                const longName = "textlint-plugin-html";
                const ruleModuleName = "no-todo";
                const result = await cli.execute(`${targetFile} --plugin ${longName} --rule ${ruleModuleName}`);
                assert.strictEqual(result, 1);
                assertHasLog();
            });
        });
        it("should lint the file with without-prefix name", function () {
            return runWithMockLog(async ({ assertHasLog }) => {
                const targetFile = path.join(__dirname, "fixtures/todo.html");
                const longName = "html";
                const ruleModuleName = "no-todo";
                const result = await cli.execute(`${targetFile} --plugin ${longName} --rule ${ruleModuleName}`);
                assert.strictEqual(result, 1);
                assertHasLog();
            });
        });
        it("should lint and correct error", function () {
            return runWithMockLog(async ({ getLogs }) => {
                const targetFile = path.join(__dirname, "fixtures/todo.html");
                const longName = "textlint-plugin-html";
                const ruleModuleName = "no-todo";
                const result = await cli.execute(
                    `${targetFile} --plugin ${longName} --rule ${ruleModuleName} --format json`
                );
                assert.strictEqual(result, 1);
                const [message] = getLogs();
                const json = JSON.parse(message);
                assert.deepStrictEqual(json, [
                    {
                        filePath: targetFile,
                        messages: [
                            {
                                column: 4,
                                index: 110,
                                line: 8,
                                loc: {
                                    end: {
                                        column: 5,
                                        line: 8
                                    },
                                    start: {
                                        column: 4,
                                        line: 8
                                    }
                                },
                                message: "Found TODO: 'TODO: THIS IS TODO'",
                                range: [110, 111],
                                ruleId: "no-todo",
                                severity: 2,
                                type: "lint"
                            }
                        ]
                    }
                ]);
            });
        });
        it("when has not error, status should be 0", function () {
            return runWithMockLog(async ({ assertNotHasLog }) => {
                const targetFile = path.join(__dirname, "fixtures/pass.html");
                const shortName = "html";
                const ruleModuleName = "no-todo";
                const result = await cli.execute(`${targetFile} --plugin ${shortName} --rule ${ruleModuleName}`);
                assert.strictEqual(result, 0);
                assertNotHasLog();
            });
        });
    });
    context("When run with --fix", function () {
        context("when no rules found", function () {
            it("show suggestion message from FAQ", function () {
                return runWithMockLog(async ({ assertMatchLog }) => {
                    const targetFile = path.join(__dirname, "fixtures/test.md");
                    const result = await cli.execute(`${targetFile} --fix`);
                    assert.strictEqual(result, 1);
                    assertMatchLog(/No rules found/);
                });
            });
        });
        context("when has rule", function () {
            it("should execute fixer", function () {
                return runWithMockLog(async ({ assertNotHasLog }) => {
                    const ruleDir = path.join(__dirname, "fixtures/fixer-rules");
                    const targetFile = path.join(__dirname, "fixtures/test.md");
                    const result = await cli.execute(`--rulesdir ${ruleDir} --fix ${targetFile}`);
                    assert.strictEqual(result, 0);
                    assertNotHasLog();
                });
            });
        });
    });
    context("When run with --quiet", function () {
        it("shows only errors, not warnings. as a result, it will be no error", function () {
            return runWithMockLog(async ({ assertNotHasLog }) => {
                const targetFile = path.join(__dirname, "fixtures/todo.html");
                const configFile = path.join(__dirname, "fixtures/quite.textlintrc.json");
                const result = await cli.execute(`${targetFile} -c ${configFile} --quiet ${targetFile}`);
                assert.strictEqual(result, 0);
                assertNotHasLog();
            });
        });
    });
    it("should show suggestion message from FAQ when no rules found", function () {
        return runWithMockLog(async ({ assertMatchLog }) => {
            const targetFile = path.join(__dirname, "fixtures/test.md");
            const result = await cli.execute(`${targetFile}`);
            assert.strictEqual(result, 1);
            assertMatchLog(/No rules found/);
        });
    });
    describe("--cache", function () {
        const cacheLocation = path.join(__dirname, ".textlintcache");
        afterEach(() => {
            try {
                fs.unlinkSync(cacheLocation);
            } catch {
                // nope
            }
        });
        it("should cache the result and create .textlintcache", function () {
            return runWithMockLog(async () => {
                const targetFile = path.join(__dirname, "fixtures/test.md");
                const ruleModuleName = "textlint-rule-no-todo";
                const result = await cli.execute(
                    `--cache --cache-location "${cacheLocation}" --rule "${ruleModuleName}" ${targetFile}`
                );
                assert.strictEqual(fs.existsSync(cacheLocation), true);
                assert.strictEqual(result, 0);
            });
        });
    });
    describe("--version", function () {
        it("should output current textlint version", function () {
            const pkg = require("../../package");
            return runWithMockLog(async ({ getLogs }) => {
                const result = await cli.execute("--version");
                assert.strictEqual(result, 0);
                assert.strictEqual(getLogs()[0], `v${pkg.version}`);
            });
        });
    });
    describe("--help", function () {
        it("should output expected help message", function () {
            return runWithMockLog(async ({ assertHasLog }) => {
                const result = await cli.execute("--help");
                assert.strictEqual(result, 0);
                assertHasLog();
            });
        });
    });
});
