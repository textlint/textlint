"use strict";

import assert from "node:assert";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

import { server } from "../src/server";

const validFilePath = path.join(__dirname, "fixtures", "ok.md");
const stdinFilename = `textlint.txt`;

function convertRawResultToObject(rawResults: any[]) {
    return rawResults.map((result) => {
        return {
            ...result,
            text: JSON.parse(result.text),
        };
    });
}

describe("MCP Server", () => {
    let client: Client, clientTransport, serverTransport;

    beforeEach(async () => {
        client = new Client({
            name: "textlint",
            version: "1.0",
        });

        [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

        await server.connect(serverTransport);
        await client.connect(clientTransport);
    });

    afterEach(async () => {
        if (client) {
            await client.close();
        }
    });

    describe("Tools", () => {
        it("should have tools", async () => {
            const { tools } = await client.listTools();
            assert.strictEqual(tools.length, 4);
            assert.strictEqual(tools[0].name, "lintFile");
        });

        describe("lintFile", () => {
            it("should return zero lint messages for a valid file", async () => {
                const { content: RawContent } = (await client.callTool({
                    name: "lintFile",
                    arguments: {
                        filePaths: [validFilePath],
                    },
                })) as CallToolResult;
                const results = convertRawResultToObject(RawContent);
                assert.deepStrictEqual(results, [
                    {
                        type: "text",
                        text: {
                            messages: [],
                            filePath: validFilePath,
                        },
                    },
                ]);
            });
        });

        describe("lintText", () => {
            it("should return zero lint messages for a valid file", async () => {
                const { content: rawContent } = (await client.callTool({
                    name: "lintText",
                    arguments: {
                        text: "This is a valid text.",
                        stdinFilename,
                    },
                })) as CallToolResult;
                const content = convertRawResultToObject(rawContent);
                assert.deepStrictEqual(content, [
                    {
                        type: "text",
                        text: {
                            messages: [],
                            filePath: stdinFilename,
                        },
                    },
                ]);
            });
        });

        describe("fixFile", () => {
            it("should return zero lint messages for a valid file", async () => {
                const { content: rawContent } = (await client.callTool({
                    name: "fixFile",
                    arguments: {
                        filePaths: [validFilePath],
                    },
                })) as CallToolResult;
                const content = convertRawResultToObject(rawContent);
                assert.deepStrictEqual(content, [
                    {
                        type: "text",
                        text: {
                            messages: [],
                            filePath: validFilePath,
                            output: "This is OK.\n",
                            applyingMessages: [],
                            remainingMessages: [],
                        },
                    },
                ]);
            });
        });

        describe("fixText", () => {
            it("should return zero lint messages for a valid file", async () => {
                const { content: rawContent } = (await client.callTool({
                    name: "fixText",
                    arguments: {
                        text: "This is a valid text.",
                        stdinFilename,
                    },
                })) as CallToolResult;
                const content = convertRawResultToObject(rawContent);
                assert.deepStrictEqual(content, [
                    {
                        type: "text",
                        text: {
                            messages: [],
                            filePath: stdinFilename,
                            output: "This is a valid text.",
                            applyingMessages: [],
                            remainingMessages: [],
                        },
                    },
                ]);
            });
        });
    });
});
