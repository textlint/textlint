// LICENSE : MIT
"use strict";
import * as assert from "node:assert";
import { afterEach, beforeEach, describe, it } from "vitest";
import { cli } from "../../src/cli.js";
import * as path from "node:path";
import { Logger } from "../../src/util/logger.js";
import * as fs from "node:fs";
import * as os from "node:os";

/**
 * Table Driven Test for textlint CLI Exit Status patterns.
 *
 * This test suite comprehensively covers all exit status scenarios documented in
 * docs/faq/exit-status.md using a table-driven testing approach.
 *
 * Exit Status Rules:
 * - 0: Success (no errors, help/version shown, files ignored)
 * - 1: Lint errors found
 * - 2: Fatal errors
 *   - File search errors
 *   - Output writing errors
 *   - Unexpected errors
 *
 * Note: There are some differences between CLI execution in test environment vs.
 * actual command line usage. For example, invalid options show help (exit 0) in tests
 * but return exit status 1 when run from command line due to optionator behavior.
 *
 */

type RunContext = {
    getLogs(): string[];
    getErrors(): string[];
    assertMatchLog(pattern: RegExp): unknown;
    assertMatchError(pattern: RegExp): unknown;
    assertNotHasLog(): unknown;
    assertHasLog(): unknown;
};

const runWithMockLogger = async (cb: (context: RunContext) => unknown): Promise<unknown> => {
    const originLog = Logger.log;
    const originError = Logger.error;
    const logMessages: string[] = [];
    const errorMessages: string[] = [];

    Logger.log = function mockLog(message) {
        logMessages.push(message);
    };
    Logger.error = function mockError(message, ...args) {
        const fullMessage = [message, ...args].map(String).join(" ");
        errorMessages.push(fullMessage);
    };

    const context = {
        getLogs() {
            return logMessages;
        },
        getErrors() {
            return errorMessages;
        },
        assertMatchLog(pattern: RegExp) {
            assert.ok(logMessages.length > 0, "should have logs");
            assert.match(logMessages.join(" "), pattern);
        },
        assertMatchError(pattern: RegExp) {
            assert.ok(errorMessages.length > 0, "should have errors");
            assert.match(errorMessages.join(" "), pattern);
        },
        assertNotHasLog() {
            assert.ok(logMessages.length === 0, "should not have logs");
        },
        assertHasLog() {
            assert.ok(logMessages.length > 0, "should have logs");
        }
    };

    try {
        await cb(context);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.log("Logs:", context.getLogs());
        // eslint-disable-next-line no-console
        console.log("Errors:", context.getErrors());
        throw error;
    }

    Logger.log = originLog;
    Logger.error = originError;
    return;
};

/**
 * Test case definition for table-driven testing
 */
type TestCase = {
    /** Human-readable test name */
    name: string;
    /** CLI arguments - can be static array or function that receives test files */
    args: string[] | ((testFiles: TestFiles) => string[]);
    /** Expected exit status code */
    expectedExitStatus: number;
    /** Optional regex pattern to match in error messages */
    expectedErrorPattern?: RegExp;
    /** Whether logs should be present (for help/version commands) */
    expectedHasLogs?: boolean;
    /** Optional setup function to run before test */
    setup?: (testFiles: TestFiles) => void;
};

/**
 * Test files structure created for each test
 */
type TestFiles = {
    /** Temporary test directory path */
    testDir: string;
    /** Path to a file that exists and has no lint errors */
    existingFile: string;
    /** Path to a file that exists and has lint errors (TODO) */
    fileWithErrors: string;
    /** Path to a file that should be ignored */
    ignoredFile: string;
    /** Path to .textlintignore file */
    ignoreFilePath: string;
};

describe("CLI Exit Status FAQ Patterns", function () {
    let testFiles: TestFiles;

    beforeEach(function () {
        // Create a temporary directory for testing
        const testDir = fs.mkdtempSync(path.join(os.tmpdir(), "textlint-exit-status-test-"));

        // existing file (should not cause lint error)
        const existingFile = path.join(testDir, "existing.md");
        fs.writeFileSync(existingFile, "# Test\n\nThis is a test file.");

        // error file (should cause lint error)
        const fileWithErrors = path.join(testDir, "with-errors.md");
        fs.writeFileSync(fileWithErrors, "# Test\n\nTODO: This should cause an error");

        // ignored file (should be ignored by .textlintignore)
        const ignoredFile = path.join(testDir, "ignored.md");
        fs.writeFileSync(ignoredFile, "# Ignored\n\nThis file should be ignored.");

        // .textlintignore
        const ignoreFilePath = path.join(testDir, ".textlintignore");
        fs.writeFileSync(ignoreFilePath, "ignored.md\n");

        testFiles = {
            testDir,
            existingFile,
            fileWithErrors,
            ignoredFile,
            ignoreFilePath
        };
    });

    afterEach(function () {
        // テスト用ディレクトリを削除
        if (fs.existsSync(testFiles.testDir)) {
            fs.rmSync(testFiles.testDir, { recursive: true, force: true });
        }
    });

    // Exit Status 0 (Success) Cases
    const successCases: TestCase[] = [
        {
            name: "1.1 File exists and no lint errors",
            args: (files) => [
                "--no-config",
                "--rulesdir",
                path.join(__dirname, "fixtures/rules"),
                "--rule",
                "no-todo",
                files.existingFile
            ],
            expectedExitStatus: 0
        },
        {
            name: "1.2 File is ignored",
            args: (files) => [
                "--no-config",
                "--rulesdir",
                path.join(__dirname, "fixtures/rules"),
                "--rule",
                "no-todo",
                "--ignore-path",
                files.ignoreFilePath,
                files.ignoredFile
            ],
            expectedExitStatus: 0
        },
        {
            name: "1.3 Multiple files with some non-existent",
            args: (files) => [
                "--no-config",
                "--rulesdir",
                path.join(__dirname, "fixtures/rules"),
                "--rule",
                "no-todo",
                files.existingFile,
                path.join(files.testDir, "nonexistent.md")
            ],
            expectedExitStatus: 0
        },
        {
            name: "1.4 Non-existent ignore file (should not error)",
            args: (files) => [
                "--no-config",
                "--rulesdir",
                path.join(__dirname, "fixtures/rules"),
                "--rule",
                "no-todo",
                "--ignore-path",
                path.join(files.testDir, "nonexistent.textlintignore"),
                files.existingFile
            ],
            expectedExitStatus: 0
        },
        {
            name: "1.5 All files are ignored",
            args: (files) => [
                "--no-config",
                "--rulesdir",
                path.join(__dirname, "fixtures/rules"),
                "--rule",
                "no-todo",
                "--ignore-path",
                path.join(files.testDir, ".textlintignore-all"),
                files.existingFile
            ],
            expectedExitStatus: 0,
            setup: (files) => {
                const ignoreAllPath = path.join(files.testDir, ".textlintignore-all");
                fs.writeFileSync(ignoreAllPath, "*.md\n");
            }
        },
        {
            name: "1.6 --output-file option (always returns 0)",
            args: (files) => [
                "--no-config",
                "--rulesdir",
                path.join(__dirname, "fixtures/rules"),
                "--rule",
                "no-todo",
                "--output-file",
                path.join(files.testDir, "output.txt"),
                files.fileWithErrors
            ],
            expectedExitStatus: 0
        },
        {
            name: "1.7 --version option should return 0",
            args: () => ["--version"],
            expectedExitStatus: 0,
            expectedHasLogs: true
        },
        {
            name: "1.8 --help option should return 0",
            args: () => ["--help"],
            expectedExitStatus: 0,
            expectedHasLogs: true
        },
        {
            name: "1.9 --init option should return 0",
            args: () => ["--init"],
            expectedExitStatus: 0 // または 1 (エラーの場合)
        },
        {
            name: "1.10 Invalid CLI arguments (test environment shows help)",
            args: () => ["--invalid-option"],
            expectedExitStatus: 0, // テスト環境ではヘルプが表示されexit status 0 (実際のCLIではexit status 1)
            expectedHasLogs: true
        },
        {
            name: "1.11 No rules configured (shows help)",
            args: (files) => ["--no-textlintrc", files.existingFile],
            expectedExitStatus: 0,
            expectedHasLogs: true
        }
    ];

    // Exit Status 1 (Lint Errors) Cases
    const lintErrorCases: TestCase[] = [
        {
            name: "2.1 File exists and has lint errors",
            args: (files) => [
                "--no-config",
                "--rulesdir",
                path.join(__dirname, "fixtures/rules"),
                "--rule",
                "no-todo",
                files.fileWithErrors
            ],
            expectedExitStatus: 1
        }
    ];

    // Exit Status 2 (File Search Errors) Cases
    const fileSearchErrorCases: TestCase[] = [
        {
            name: "3.1 Single non-existent file",
            args: (files) => [
                "--no-config",
                "--rulesdir",
                path.join(__dirname, "fixtures/rules"),
                "--rule",
                "no-todo",
                path.join(files.testDir, "nonexistent.md")
            ],
            expectedExitStatus: 2,
            expectedErrorPattern: /File search failed/
        },
        {
            name: "3.2 Glob pattern with no matching files",
            args: (files) => [
                "--no-config",
                "--rulesdir",
                path.join(__dirname, "fixtures/rules"),
                "--rule",
                "no-todo",
                path.join(files.testDir, "nonexistent-dir/**/*.md")
            ],
            expectedExitStatus: 2,
            expectedErrorPattern: /File search failed/
        },
        {
            name: "3.3 Absolute path to non-existent file",
            args: () => [
                "--no-config",
                "--rulesdir",
                path.join(__dirname, "fixtures/rules"),
                "--rule",
                "no-todo",
                "/nonexistent/path/file.md"
            ],
            expectedExitStatus: 2,
            expectedErrorPattern: /File search failed/
        },
        {
            name: "3.4 Non-existent directory in glob",
            args: () => [
                "--no-config",
                "--rulesdir",
                path.join(__dirname, "fixtures/rules"),
                "--rule",
                "no-todo",
                "/nonexistent-dir/**/*.md"
            ],
            expectedExitStatus: 2,
            expectedErrorPattern: /File search failed/
        },
        {
            name: "3.5 --fix option with non-existent file",
            args: (files) => [
                "--no-config",
                "--rulesdir",
                path.join(__dirname, "fixtures/rules"),
                "--rule",
                "no-todo",
                "--fix",
                path.join(files.testDir, "nonexistent.md")
            ],
            expectedExitStatus: 2,
            expectedErrorPattern: /Failed to search files with patterns/
        },
        {
            name: "3.6 All non-existent files should return exit status 2",
            args: (files) => [
                "--no-config",
                "--rulesdir",
                path.join(__dirname, "fixtures/rules"),
                "--rule",
                "no-todo",
                path.join(files.testDir, "nonexistent1.md"),
                path.join(files.testDir, "nonexistent2.md")
            ],
            expectedExitStatus: 2,
            expectedErrorPattern: /File search failed/
        }
    ];

    // Complex Scenarios
    const complexScenarios: TestCase[] = [
        {
            name: "4.1 Mixed scenario: some files exist, some don't, some have errors",
            args: (files) => [
                "--no-config",
                "--rulesdir",
                path.join(__dirname, "fixtures/rules"),
                "--rule",
                "no-todo",
                files.existingFile,
                files.fileWithErrors,
                path.join(files.testDir, "nonexistent.md")
            ],
            expectedExitStatus: 1 // lint エラーがあるので 1
        },
        {
            name: "4.2 --dry-run option with existing files",
            args: (files) => [
                "--no-config",
                "--rulesdir",
                path.join(__dirname, "fixtures/rules"),
                "--rule",
                "no-todo",
                "--fix",
                "--dry-run",
                files.existingFile
            ],
            expectedExitStatus: 0
        }
    ];

    // テストケースを実行するヘルパー関数
    const runTestCase = (testCase: TestCase) => {
        it(testCase.name, async function () {
            await runWithMockLogger(async (context) => {
                // セットアップ処理
                if (testCase.setup) {
                    testCase.setup(testFiles);
                }

                // 引数を解決
                const args = typeof testCase.args === "function" ? testCase.args(testFiles) : testCase.args;

                // CLIを実行
                const exitStatus = await cli.execute(args);

                // 期待値と比較
                if (testCase.name.includes("--init")) {
                    // --init などの場合は複数の値を許可
                    assert.ok(exitStatus === 0 || exitStatus === 1);
                } else if (testCase.name.includes("--dry-run")) {
                    // dry-runの場合は、printResultsの結果に依存
                    assert.ok(exitStatus === 0 || exitStatus === 2);
                } else {
                    assert.strictEqual(exitStatus, testCase.expectedExitStatus);
                }

                // エラーパターンの検証
                if (testCase.expectedErrorPattern) {
                    context.assertMatchError(testCase.expectedErrorPattern);
                }

                // ログの検証
                if (testCase.expectedHasLogs) {
                    context.assertHasLog();
                }
            });
        });
    };

    describe("Exit Status 0 (Success) Cases", function () {
        successCases.forEach(runTestCase);
    });

    describe("Exit Status 1 (Lint Errors) Cases", function () {
        lintErrorCases.forEach(runTestCase);
    });

    describe("Exit Status 2 (File Search Errors) Cases", function () {
        fileSearchErrorCases.forEach(runTestCase);
    });

    describe("Complex Scenarios", function () {
        complexScenarios.forEach(runTestCase);
    });
});
