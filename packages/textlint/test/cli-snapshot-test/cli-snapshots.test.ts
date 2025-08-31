// LICENSE : MIT
"use strict";
import * as fs from "node:fs";
import { describe, it } from "vitest";
import * as path from "node:path";
import * as assert from "node:assert";
import { cli } from "../../src/cli.js";
import { Logger } from "../../src/util/logger.js";

const SNAPSHOTS_DIRECTORY = path.join(__dirname, "snapshots");
const FAKE_MODULES_DIRECTORY = path.join(__dirname, "rule_modules");

// Normalize paths for cross-platform compatibility
const normalizePath = (value: string) => {
    return path.sep === "\\" ? value.replace(/\\/g, "/") : value;
};

// Replace absolute paths in output for deterministic snapshots
const pathReplacer = (dirPath: string, fakeModulesPath: string) => {
    return function replacer(_key: string, value: unknown): unknown {
        if (typeof value === "string") {
            let stringValue = value;
            // Replace absolute paths
            if (stringValue.includes(dirPath)) {
                stringValue = normalizePath(stringValue.replace(dirPath, "<snapshots>"));
            }
            if (stringValue.includes(fakeModulesPath)) {
                stringValue = normalizePath(stringValue.replace(fakeModulesPath, "<node_modules>"));
            }
            // Normalize other paths
            return normalizePath(stringValue);
        }
        return value;
    };
};

type RunContext = {
    getLogs(): string[];
    assertMatchLog(pattern: RegExp): unknown;
    assertNotHasLog(): unknown;
    assertHasLog(): unknown;
};

const runWithMockLog = async (cb: (context: RunContext) => unknown): Promise<unknown> => {
    const originLog = Logger.log;
    const messages: string[] = [];
    Logger.log = function mockLog(...message: unknown[]) {
        messages.push(message.join(" "));
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
        console.log("Logs", context.getLogs());
        throw error;
    }
    Logger.log = originLog;
    return;
};

// Helper to normalize JSON output for consistent snapshots
const normalizeJSON = (output: string, rootDir: string, fakeModulesDir: string) => {
    try {
        const parsed = JSON.parse(output);
        return JSON.parse(JSON.stringify(parsed, pathReplacer(rootDir, fakeModulesDir)));
    } catch {
        // If not JSON, just normalize paths
        return pathReplacer(rootDir, fakeModulesDir)("", output);
    }
};

describe("textlint-cli-snapshots", () => {
    fs.readdirSync(SNAPSHOTS_DIRECTORY).forEach((caseName) => {
        const normalizedTestName = caseName.replace(/-/g, " ");
        it(`Test ${normalizedTestName}`, async function () {
            return runWithMockLog(async ({ getLogs }) => {
                const fixtureDir = path.join(SNAPSHOTS_DIRECTORY, caseName);
                const inputFilePath = path.join(fixtureDir, "input.md");
                const configFilePath = path.join(fixtureDir, "textlintrc.json");

                // Check if required files exist
                if (!fs.existsSync(inputFilePath)) {
                    throw new Error(`input.md not found in ${fixtureDir}`);
                }
                if (!fs.existsSync(configFilePath)) {
                    throw new Error(`textlintrc.json not found in ${fixtureDir}`);
                }

                // Run textlint CLI with the test files
                const exitCode = await cli.execute(
                    `--config "${configFilePath}" --rules-base-directory="${FAKE_MODULES_DIRECTORY}" --format json "${inputFilePath}"`
                );

                const capturedOutput = getLogs().join("\n");

                // Create result object
                const actualResult = {
                    exitCode,
                    output: capturedOutput
                        ? normalizeJSON(capturedOutput, SNAPSHOTS_DIRECTORY, FAKE_MODULES_DIRECTORY)
                        : ""
                };

                const expectedFilePath = path.join(fixtureDir, "output.json");

                // Usage: update snapshots
                // UPDATE_SNAPSHOT=1 npm test
                if (!fs.existsSync(expectedFilePath) || process.env.UPDATE_SNAPSHOT) {
                    fs.writeFileSync(expectedFilePath, JSON.stringify(actualResult, null, 4));
                    return; // skip when updating snapshots
                }

                // Compare with expected output
                const expectedContent = JSON.parse(fs.readFileSync(expectedFilePath, "utf-8"));
                assert.deepStrictEqual(actualResult, expectedContent);
            });
        });
    });
});
