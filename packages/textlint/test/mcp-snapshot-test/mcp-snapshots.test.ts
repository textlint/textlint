import assert from "node:assert";
import { describe, it, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { setupServer } from "../../src/mcp/server.js";
import {
    SNAPSHOTS_DIRECTORY,
    FAKE_MODULES_DIRECTORY,
    normalizeResponse,
    readSnapshotInput,
    readSnapshotOutput,
    writeSnapshotOutput,
    resolveRequestPaths,
    shouldUpdateSnapshots
} from "./snapshot-utils.js";
import type { SnapshotInput, McpResponse } from "./types.js";

describe("MCP Server Snapshot Tests", () => {
    // Skip if snapshots directory doesn't exist
    if (!fs.existsSync(SNAPSHOTS_DIRECTORY)) {
        it.skip("snapshots directory not found", () => {});
        return;
    }

    const snapshotCases = fs.readdirSync(SNAPSHOTS_DIRECTORY).filter((name) => {
        const snapshotDir = path.join(SNAPSHOTS_DIRECTORY, name);
        return fs.statSync(snapshotDir).isDirectory() && fs.existsSync(path.join(snapshotDir, "input.json"));
    });

    // Skip if no test cases found
    if (snapshotCases.length === 0) {
        it.skip("no snapshot test cases found", () => {});
        return;
    }

    snapshotCases.forEach((caseName) => {
        describe(`${caseName}`, () => {
            let client: Client;
            let server: McpServer;
            let snapshotDir: string;
            let input: SnapshotInput;

            beforeEach(async () => {
                snapshotDir = path.join(SNAPSHOTS_DIRECTORY, caseName);
                input = readSnapshotInput(snapshotDir);

                // Setup server with test case configuration
                const serverOptions = input.serverOptions || {};

                // If using custom node_modules, set it to our fake modules
                if (
                    serverOptions.node_modulesDir ||
                    (serverOptions.configFilePath && serverOptions.configFilePath.includes("rule_modules"))
                ) {
                    serverOptions.node_modulesDir = FAKE_MODULES_DIRECTORY;
                }

                // Resolve config file path relative to snapshot directory
                if (serverOptions.configFilePath && !path.isAbsolute(serverOptions.configFilePath)) {
                    serverOptions.configFilePath = path.join(snapshotDir, serverOptions.configFilePath);
                }

                server = await setupServer(serverOptions);

                // Setup MCP client
                client = new Client({
                    name: `textlint-snapshot-${caseName}`,
                    version: "1.0"
                });

                const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
                await server.connect(serverTransport);
                await client.connect(clientTransport);
            });

            afterEach(async () => {
                if (client) {
                    await client.close();
                }
                if (server) {
                    await server.close();
                }
            });

            it("should match expected output", async () => {
                // Resolve file paths in request relative to snapshot directory
                const resolvedRequest = resolveRequestPaths(input.request, snapshotDir);

                // Execute MCP tool request
                const result = (await client.callTool(resolvedRequest)) as CallToolResult;

                // Normalize the response for snapshot comparison
                const normalizedResult = normalizeResponse(result as McpResponse, snapshotDir);

                if (shouldUpdateSnapshots()) {
                    // Update snapshot mode
                    writeSnapshotOutput(snapshotDir, normalizedResult);
                    console.log(`Updated snapshot: ${caseName}`);
                } else {
                    // Compare with expected output
                    const expectedOutput = readSnapshotOutput(snapshotDir);

                    try {
                        assert.deepStrictEqual(normalizedResult, expectedOutput);
                    } catch (error) {
                        console.error(`Snapshot mismatch in ${caseName}:`);
                        console.error("Actual:");
                        console.error(JSON.stringify(normalizedResult, null, 2));
                        console.error("Expected:");
                        console.error(JSON.stringify(expectedOutput, null, 2));
                        throw error;
                    }
                }
            });
        });
    });
});
