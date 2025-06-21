import assert from "node:assert";
import { afterEach, beforeEach, describe, it } from "vitest";
import path from "node:path";
import { readFileSync } from "node:fs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

import { server } from "../../src/mcp/server.js";

const validFilePath = path.join(__dirname, "fixtures", "ok.md");
const stdinFilename = `textlint.txt`;

describe("MCP Server", () => {
    let client: Client, clientTransport, serverTransport;

    beforeEach(async () => {
        client = new Client({
            name: "textlint",
            version: "1.0"
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

    // Phase 1: 改善点のテスト
    describe("Phase 1 Improvements", () => {
        describe("Structured Tool Output", () => {
            it("should return structured content and regular content", async () => {
                const result = (await client.callTool({
                    name: "lintFile",
                    arguments: {
                        filePaths: [validFilePath]
                    }
                })) as CallToolResult;

                // Phase 1: Verify isError flag is set correctly
                assert.strictEqual(result.isError, false, "isError should be false for successful operations");

                // Verify both content and structuredContent are present
                assert.ok(result.content, "Should have content field");
                assert.ok(result.structuredContent, "Should have structuredContent field");

                // Verify content is readable JSON
                const firstContent = result.content[0];
                assert.strictEqual(firstContent.type, "text");
                const parsedContentText = JSON.parse(firstContent.text);
                assert.ok(typeof parsedContentText === "object", "Content text should be parseable JSON");

                // Verify structuredContent is actual object (not string)
                assert.ok(typeof result.structuredContent === "object", "structuredContent should be an object");
                assert.ok(
                    result.structuredContent.hasOwnProperty("results"),
                    "structuredContent should have results property"
                );
                assert.ok(
                    result.structuredContent.hasOwnProperty("isError"),
                    "structuredContent should have isError property"
                );
                assert.ok(
                    result.structuredContent.hasOwnProperty("timestamp"),
                    "structuredContent should have timestamp property"
                );

                // Verify JSON is pretty-printed (better than single-line)
                assert.ok(firstContent.text.includes("\n"), "JSON should be pretty-printed with newlines");
            });

            it("should return structured content for lintText", async () => {
                const testText = readFileSync(validFilePath, "utf-8");
                const result = (await client.callTool({
                    name: "lintText",
                    arguments: {
                        text: testText,
                        stdinFilename
                    }
                })) as CallToolResult;

                // Verify both content and structuredContent
                assert.ok(result.content, "Should have content field");
                assert.ok(result.structuredContent, "Should have structuredContent field");
                assert.strictEqual(result.isError, false, "isError should be false for successful operations");

                // Verify structuredContent structure
                assert.ok(
                    result.structuredContent.hasOwnProperty("filePath"),
                    "structuredContent should have filePath property"
                );
                assert.ok(
                    result.structuredContent.hasOwnProperty("messages"),
                    "structuredContent should have messages property"
                );
                assert.ok(
                    result.structuredContent.hasOwnProperty("isError"),
                    "structuredContent should have isError property"
                );
            });
        });

        describe("Output Schema", () => {
            it("should have proper schema for lintFile tool", async () => {
                const { tools } = await client.listTools();
                const lintFileTool = tools.find((tool) => tool.name === "lintFile");

                assert.ok(lintFileTool, "lintFile tool should exist");
                assert.ok(lintFileTool.outputSchema, "lintFile tool should have outputSchema defined");

                // スキーマの構造をチェック
                const schema = lintFileTool.outputSchema;
                assert.ok(schema.type, "outputSchema should have type");
                assert.ok(schema.properties, "outputSchema should have properties");
            });

            it("should have proper schema for lintText tool", async () => {
                const { tools } = await client.listTools();
                const lintTextTool = tools.find((tool) => tool.name === "lintText");

                assert.ok(lintTextTool, "lintText tool should exist");
                assert.ok(lintTextTool.outputSchema, "lintText tool should have outputSchema defined");
            });

            it("should have proper schema for getLintFixedFileContent tool", async () => {
                const { tools } = await client.listTools();
                const fixFileTool = tools.find((tool) => tool.name === "getLintFixedFileContent");

                assert.ok(fixFileTool, "getLintFixedFileContent tool should exist");
                assert.ok(fixFileTool.outputSchema, "getLintFixedFileContent tool should have outputSchema defined");
            });

            it("should have proper schema for getLintFixedTextContent tool", async () => {
                const { tools } = await client.listTools();
                const fixTextTool = tools.find((tool) => tool.name === "getLintFixedTextContent");

                assert.ok(fixTextTool, "getLintFixedTextContent tool should exist");
                assert.ok(fixTextTool.outputSchema, "getLintFixedTextContent tool should have outputSchema defined");
            });

            it("should validate output against defined schema", async () => {
                const result = (await client.callTool({
                    name: "lintFile",
                    arguments: {
                        filePaths: [validFilePath]
                    }
                })) as CallToolResult;

                // The response should have structured content that matches the output schema
                assert.ok(result.structuredContent, "Response should have structured content");

                // Verify the structure matches expected schema
                const structured = result.structuredContent;
                assert.ok(structured.hasOwnProperty("results"), "Should have results property");
                assert.ok(structured.hasOwnProperty("isError"), "Should have isError property");
                assert.ok(structured.hasOwnProperty("timestamp"), "Should have timestamp property");
                assert.strictEqual(typeof structured.isError, "boolean", "isError should be boolean");
                assert.ok(Array.isArray(structured.results), "results should be array");
            });
        });

        describe("Error Handling", () => {
            it("should handle file not found error with isError flag", async () => {
                const nonExistentFile = path.join(__dirname, "fixtures", "nonexistent.md");

                const result = (await client.callTool({
                    name: "lintFile",
                    arguments: {
                        filePaths: [nonExistentFile]
                    }
                })) as CallToolResult;

                // Phase 1: isError flag should be true for errors
                assert.strictEqual(result.isError, true, "isError should be true for non-existent file");

                // Error should still have structured content
                assert.ok(result.structuredContent, "Error should have structured content");
                assert.ok(result.structuredContent.error, "Error structured content should have error property");
                assert.strictEqual(
                    result.structuredContent.isError,
                    true,
                    "Error structured content should have isError=true"
                );

                // Content should also be structured
                assert.ok(Array.isArray(result.content), "content should be an array even for errors");
                if (result.content.length > 0) {
                    assert.strictEqual(result.content[0].type, "text");
                    const parsedContent = JSON.parse(result.content[0].text);
                    assert.ok(parsedContent.error, "Content should contain error information");
                }
            });

            it("should set isError=false for successful operations", async () => {
                const testText = readFileSync(validFilePath, "utf-8");
                const result = (await client.callTool({
                    name: "lintText",
                    arguments: {
                        text: testText,
                        stdinFilename
                    }
                })) as CallToolResult;

                assert.strictEqual(
                    result.isError,
                    false,
                    "Response should have isError=false for successful operations"
                );
                assert.ok(result.structuredContent, "Successful response should have structured content");
                assert.strictEqual(
                    result.structuredContent.isError,
                    false,
                    "Structured content should have isError=false"
                );
            });
        });
    });

    describe("Basic Tool Functionality", () => {
        it("should have all required tools", async () => {
            const { tools } = await client.listTools();
            assert.strictEqual(tools.length, 4);

            const toolNames = tools.map((tool) => tool.name);
            assert.ok(toolNames.includes("lintFile"), "Should have lintFile tool");
            assert.ok(toolNames.includes("lintText"), "Should have lintText tool");
            assert.ok(toolNames.includes("getLintFixedFileContent"), "Should have getLintFixedFileContent tool");
            assert.ok(toolNames.includes("getLintFixedTextContent"), "Should have getLintFixedTextContent tool");
        });

        it("should lint a valid file with zero messages", async () => {
            const result = (await client.callTool({
                name: "lintFile",
                arguments: {
                    filePaths: [validFilePath]
                }
            })) as CallToolResult;

            assert.ok(result.structuredContent, "Should have structured content");
            assert.ok(Array.isArray(result.structuredContent.results), "Should have results array");

            if (result.structuredContent.results.length > 0) {
                const firstResult = result.structuredContent.results[0];
                assert.ok(Array.isArray(firstResult.messages), "Should have messages array");
                assert.strictEqual(firstResult.filePath, validFilePath, "Should have correct file path");
            }
        });

        it("should lint text content with zero messages", async () => {
            const testText = readFileSync(validFilePath, "utf-8");
            const result = (await client.callTool({
                name: "lintText",
                arguments: {
                    text: testText,
                    stdinFilename
                }
            })) as CallToolResult;

            assert.ok(result.structuredContent, "Should have structured content");
            assert.ok(Array.isArray(result.structuredContent.messages), "Should have messages array");
            assert.strictEqual(result.structuredContent.filePath, stdinFilename, "Should have correct file path");
        });
    });
});
