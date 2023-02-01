// LICENSE : MIT
"use strict";
import * as assert from "assert";
import { cli } from "../../src/cli";
import * as path from "path";
import { Logger } from "../../src/util/logger";
import * as fs from "fs";
import { loadBuiltinPlugins } from "../../src/loader/TextlintrcLoader";
import * as os from "os";

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
        it("should return 1 which is lint error code", function () {
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
    context("--fix", function () {
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
        context("when has rule, but no fix", function () {
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
        context("when has rule and fix it", function () {
            const targetFilePath = path.join(os.tmpdir(), "fix-input-copy-file.md");
            beforeEach(async () => {
                try {
                    await fs.promises.unlink(targetFilePath);
                } catch {
                    /* ignore */
                }
            });
            it("should modify the file", async function () {
                const ruleDir = path.join(__dirname, "fixtures/fixer-rules");
                const inputFilePath = path.join(__dirname, "fixtures/fixer-rules/input.md");
                const expectedFilePath = path.join(__dirname, "fixtures/fixer-rules/output.md");
                await fs.promises.copyFile(inputFilePath, targetFilePath);
                const result = await cli.execute(`--rulesdir ${ruleDir} --fix ${inputFilePath}`);
                assert.strictEqual(result, 0);
                const resultContent = await fs.promises.readFile(targetFilePath, "utf-8");
                const expectedContent = await fs.promises.readFile(expectedFilePath, "utf-8");
                assert.strictEqual(resultContent, expectedContent);
            });
            it("should not modify the file when --dry-run", async function () {
                const ruleDir = path.join(__dirname, "fixtures/fixer-rules");
                const inputFilePath = path.join(__dirname, "fixtures/fixer-rules/input.md");
                await fs.promises.copyFile(inputFilePath, targetFilePath);
                const result = await cli.execute(`--rulesdir ${ruleDir} --fix ${inputFilePath} --dry-run`);
                assert.strictEqual(result, 0);
                const inputContent = await fs.promises.readFile(inputFilePath, "utf-8");
                const resultContent = await fs.promises.readFile(targetFilePath, "utf-8");
                assert.strictEqual(resultContent, inputContent);
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
    describe("--print-config", function () {
        it("should print current descriptor.toJSON()", function () {
            return runWithMockLog(async ({ getLogs }) => {
                const result = await cli.execute(`--print-config`);
                assert.strictEqual(result, 0);
                const expected = await loadBuiltinPlugins();
                assert.strictEqual(getLogs()[0], JSON.stringify(expected.toJSON(), null, 4));
            });
        });
        it("should print current descriptor.toJSON() with .textlintrc", function () {
            return runWithMockLog(async ({ getLogs }) => {
                const configFile = path.join(__dirname, "fixtures/.textlintrc.json");
                const result = await cli.execute(`--print-config --config ${configFile}`);
                assert.strictEqual(result, 0);
                const expected = await loadBuiltinPlugins();
                assert.strictEqual(
                    getLogs()[0],
                    JSON.stringify(
                        {
                            ...expected.toJSON(),
                            rule: [
                                {
                                    ruleId: "textlint-rule-no-todo",
                                    options: {
                                        severity: "warning"
                                    }
                                }
                            ],
                            configBaseDir: path.dirname(configFile)
                        },
                        null,
                        4
                    )
                );
            });
        });
        it("should print current descriptor.toJSON() when add a --rule", function () {
            return runWithMockLog(async ({ getLogs }) => {
                const ruleModuleName = "textlint-rule-no-todo";
                const result = await cli.execute(`--print-config --rule ${ruleModuleName}`);
                assert.strictEqual(result, 0);
                const expected = await loadBuiltinPlugins();
                assert.strictEqual(
                    getLogs()[0],
                    JSON.stringify(
                        {
                            ...expected.toJSON(),
                            rule: [
                                {
                                    ruleId: "no-todo",
                                    options: true
                                }
                            ]
                        },
                        null,
                        4
                    )
                );
            });
        });
    });
    describe("--ignore-path /path/to/.textlintignore", function () {
        it("should ignore test.md", async function () {
            const fixtureDir = path.posix.join(__dirname, "fixtures");
            const ruleModuleName = "textlint-rule-no-todo";
            const ignoreFile = path.join(__dirname, "fixtures/all-md.textlintignore");
            const result = await cli.execute(
                `--rule "${ruleModuleName}" "${fixtureDir}/**/*.md" --ignore-path ${ignoreFile}"`
            );
            assert.strictEqual(result, 0);
        });
    });
    describe("--outputFile /path/to/output.txt", function () {
        const tmpFilePath = path.join(os.tmpdir(), "textlint.output.txt");
        beforeEach(() => {
            try {
                fs.unlinkSync(tmpFilePath);
            } catch {
                /*nope*/
            }
        });
        it("should output lint result as file and exit 0", async function () {
            const fixtureDir = path.posix.join(__dirname, "fixtures");
            const ruleModuleName = "textlint-rule-no-todo";
            const result = await cli.execute(
                `--rule "${ruleModuleName}" "${fixtureDir}/**/*.md" --output-file ${tmpFilePath}`
            );
            assert.strictEqual(result, 0);
            const outputFileContent = await fs.promises.readFile(tmpFilePath, "utf-8");
            assert.match(outputFileContent, /\d+ problem/);
        });
    });
    describe("--no-textlint", function () {
        it("should not load textlintrc, but load built-in plugins", function () {
            return runWithMockLog(async ({ getLogs }) => {
                const result = await cli.execute(`--no-textlintrc --print-config`);
                assert.strictEqual(result, 0);
                const expected = await loadBuiltinPlugins();
                assert.strictEqual(getLogs()[0], JSON.stringify(expected.toJSON(), null, 4));
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
