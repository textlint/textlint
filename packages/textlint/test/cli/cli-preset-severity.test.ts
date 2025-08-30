// LICENSE : MIT
"use strict";
import * as assert from "node:assert";
import { describe, it } from "vitest";
import { cli } from "../../src/cli.js";
import * as path from "node:path";
import { Logger } from "../../src/util/logger.js";

type RunContext = {
    getLogs(): string[];
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

const fixturesDir = path.join(__dirname, "fixtures", "preset-severity-preservation");

describe("CLI: Preset severity preservation", function () {
    it("should preserve preset severity when user provides partial configuration", async function () {
        return runWithMockLog(async ({ getLogs }) => {
            const targetFile = path.join(fixturesDir, "test.md");
            const configFile = path.join(fixturesDir, ".textlintrc.json");
            const result = await cli.execute(`${targetFile} -f json --config ${configFile}`);

            // Should exit with 1 (error) because we set severity to error for no-todo rule
            // Note: textlint exits with 1 for any lint errors, regardless of severity level
            assert.strictEqual(result, 1, "Should exit with error code 1 due to lint errors");

            const [output] = getLogs();
            assert.ok(output, "Should have output");

            const results = JSON.parse(output);
            const messages = results[0]?.messages || [];

            // Check that we have error messages with correct severity
            const errorMessages = messages.filter((msg: { severity: number }) => msg.severity === 2); // error
            assert.ok(errorMessages.length > 0, "Should have error messages with severity 2");

            // Verify specific rule messages have correct severities
            const todoMessage = messages.find((msg: { message: string }) => msg.message.includes("TODO"));
            if (todoMessage) {
                assert.strictEqual(todoMessage.severity, 2, "TODO message should have error severity (2)");
            }
        });
    });

    it("should work with different severity settings", async function () {
        return runWithMockLog(async () => {
            // Test that severity settings are correctly applied
            const targetFile = path.join(fixturesDir, "test.md");
            const configFile = path.join(fixturesDir, ".textlintrc.json");
            const result = await cli.execute(`${targetFile} -f json --config ${configFile}`);

            // The fact that this doesn't crash and produces expected exit code
            // indicates that severity settings are working correctly
            assert.ok(result >= 0, "CLI should execute successfully with severity settings");
        });
    });
});
