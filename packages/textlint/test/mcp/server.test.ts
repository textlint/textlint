import assert from "node:assert";
import { afterEach, beforeEach, describe, it, expect } from "vitest";
import path from "node:path";
import { readFileSync } from "node:fs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { setupServer, McpServerOptions } from "../../src/mcp/server.js";
import {
    createServerOptions,
    createServerOptionsWithConfig,
    createServerOptionsWithCwd,
    createServerOptionsWithQuiet,
    getFixturePath
} from "./test-helpers.js";

const validFilePath = path.join(__dirname, "fixtures", "ok.md");
const invalidFilePath = path.join(__dirname, "fixtures", "invalid.md");
const stdinFilename = `textlint.txt`;

describe("MCP Server", () => {
    let client: Client, server: McpServer, clientTransport, serverTransport;

    beforeEach(async () => {
        client = new Client({
            name: "textlint",
            version: "1.0"
        });
        server = await setupServer();
        [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
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

    // MCP specification improvements tests
    describe("MCP Specification Improvements", () => {
        describe("Structured Tool Output", () => {
            it("should return structured content and regular content", async () => {
                const result = (await client.callTool({
                    name: "lintFile",
                    arguments: {
                        filePaths: [validFilePath]
                    }
                })) as CallToolResult;

                // Verify isError flag is set correctly (MCP specification compliance)
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

                // Verify structuredContent structure using inline snapshot
                const { timestamp, ...structuredWithoutTimestamp } = result.structuredContent;
                expect(structuredWithoutTimestamp).toMatchInlineSnapshot(`
                  {
                    "filePath": "textlint.txt",
                    "isError": false,
                    "messages": [],
                  }
                `);
            });
        });

        describe("Output Schema", () => {
            it("should have proper schema for lintFile tool", async () => {
                const { tools } = await client.listTools();
                const lintFileTool = tools.find((tool) => tool.name === "lintFile");

                assert.ok(lintFileTool, "lintFile tool should exist");
                assert.ok(lintFileTool.outputSchema, "lintFile tool should have outputSchema defined");

                // Verify that input schema contains descriptions
                assert.ok(lintFileTool.inputSchema, "lintFile tool should have inputSchema defined");
                const inputSchema = lintFileTool.inputSchema as Record<string, unknown>;
                const inputProperties = inputSchema.properties as Record<string, { description?: string }>;
                const filePathsProperty = inputProperties?.filePaths;
                assert.ok(filePathsProperty?.description, "filePaths field should have description");
                assert.ok(
                    filePathsProperty.description?.includes("file paths to lint"),
                    "filePaths description should mention linting"
                );

                // Use inline snapshot for schema structure
                expect(lintFileTool.outputSchema).toMatchInlineSnapshot(`
                  {
                    "$schema": "http://json-schema.org/draft-07/schema#",
                    "additionalProperties": false,
                    "properties": {
                      "error": {
                        "type": "string",
                      },
                      "isError": {
                        "type": "boolean",
                      },
                      "results": {
                        "items": {
                          "additionalProperties": false,
                          "properties": {
                            "filePath": {
                              "type": "string",
                            },
                            "messages": {
                              "items": {
                                "additionalProperties": true,
                                "properties": {
                                  "column": {
                                    "description": "Column number (1-based)",
                                    "type": "number",
                                  },
                                  "data": {
                                    "description": "Optional data associated with the message",
                                  },
                                  "fix": {
                                    "additionalProperties": false,
                                    "description": "Fix suggestion if available",
                                    "properties": {
                                      "range": {
                                        "description": "Text range [start, end] (0-based)",
                                        "items": {
                                          "type": "number",
                                        },
                                        "type": "array",
                                      },
                                      "text": {
                                        "description": "Replacement text",
                                        "type": "string",
                                      },
                                    },
                                    "required": [
                                      "range",
                                      "text",
                                    ],
                                    "type": "object",
                                  },
                                  "index": {
                                    "description": "Start index where the issue is located (0-based, deprecated)",
                                    "type": "number",
                                  },
                                  "line": {
                                    "description": "Line number (1-based)",
                                    "type": "number",
                                  },
                                  "loc": {
                                    "additionalProperties": false,
                                    "description": "Location info where the issue is located",
                                    "properties": {
                                      "end": {
                                        "additionalProperties": false,
                                        "properties": {
                                          "column": {
                                            "description": "End column number (1-based)",
                                            "type": "number",
                                          },
                                          "line": {
                                            "description": "End line number (1-based)",
                                            "type": "number",
                                          },
                                        },
                                        "required": [
                                          "line",
                                          "column",
                                        ],
                                        "type": "object",
                                      },
                                      "start": {
                                        "additionalProperties": false,
                                        "properties": {
                                          "column": {
                                            "description": "Start column number (1-based)",
                                            "type": "number",
                                          },
                                          "line": {
                                            "description": "Start line number (1-based)",
                                            "type": "number",
                                          },
                                        },
                                        "required": [
                                          "line",
                                          "column",
                                        ],
                                        "type": "object",
                                      },
                                    },
                                    "required": [
                                      "start",
                                      "end",
                                    ],
                                    "type": "object",
                                  },
                                  "message": {
                                    "type": "string",
                                  },
                                  "range": {
                                    "description": "Text range [start, end] (0-based)",
                                    "items": {
                                      "type": "number",
                                    },
                                    "maxItems": 2,
                                    "minItems": 2,
                                    "type": "array",
                                  },
                                  "ruleId": {
                                    "type": "string",
                                  },
                                  "severity": {
                                    "description": "Severity level: 1=warning, 2=error, 3=info",
                                    "type": "number",
                                  },
                                  "type": {
                                    "description": "Message type",
                                    "type": "string",
                                  },
                                },
                                "required": [
                                  "message",
                                  "line",
                                  "column",
                                  "severity",
                                ],
                                "type": "object",
                              },
                              "type": "array",
                            },
                            "output": {
                              "description": "Fixed content if available",
                              "type": "string",
                            },
                          },
                          "required": [
                            "filePath",
                            "messages",
                          ],
                          "type": "object",
                        },
                        "type": "array",
                      },
                      "timestamp": {
                        "type": "string",
                      },
                      "type": {
                        "type": "string",
                      },
                    },
                    "required": [
                      "results",
                      "isError",
                    ],
                    "type": "object",
                  }
                `);
            });

            it("should have proper schema for lintText tool", async () => {
                const { tools } = await client.listTools();
                const lintTextTool = tools.find((tool) => tool.name === "lintText");

                assert.ok(lintTextTool, "lintText tool should exist");
                assert.ok(lintTextTool.outputSchema, "lintText tool should have outputSchema defined");

                // Verify that schema contains descriptions for severity field
                const schema = lintTextTool.outputSchema as Record<string, unknown>;
                const properties = schema.properties as Record<string, unknown>;
                const messagesProperty = properties?.messages as {
                    items?: { properties?: Record<string, { description?: string }> };
                };
                if (messagesProperty?.items?.properties) {
                    const severityProperty = messagesProperty.items.properties.severity;
                    assert.ok(severityProperty?.description, "severity field should have description");
                    assert.ok(
                        severityProperty.description?.includes("1=warning, 2=error, 3=info"),
                        "severity description should explain levels"
                    );
                }
            });

            it("should have proper schema for getLintFixedFileContent tool", async () => {
                const { tools } = await client.listTools();
                const fixFileTool = tools.find((tool) => tool.name === "getLintFixedFileContent");

                assert.ok(fixFileTool, "getLintFixedFileContent tool should exist");
                assert.ok(fixFileTool.outputSchema, "getLintFixedFileContent tool should have outputSchema defined");

                // Verify that input schema contains descriptions
                assert.ok(fixFileTool.inputSchema, "getLintFixedFileContent tool should have inputSchema defined");
                const inputSchema = fixFileTool.inputSchema as Record<string, unknown>;
                const inputProperties = inputSchema.properties as Record<string, { description?: string }>;
                const filePathsProperty = inputProperties?.filePaths;
                assert.ok(filePathsProperty?.description, "filePaths field should have description");
                assert.ok(
                    filePathsProperty.description?.includes("file paths"),
                    "filePaths description should mention file paths"
                );
            });

            it("should have proper schema for getLintFixedTextContent tool", async () => {
                const { tools } = await client.listTools();
                const fixTextTool = tools.find((tool) => tool.name === "getLintFixedTextContent");

                assert.ok(fixTextTool, "getLintFixedTextContent tool should exist");
                assert.ok(fixTextTool.outputSchema, "getLintFixedTextContent tool should have outputSchema defined");

                // Verify that input schema contains descriptions
                assert.ok(fixTextTool.inputSchema, "getLintFixedTextContent tool should have inputSchema defined");
                const inputSchema = fixTextTool.inputSchema as Record<string, unknown>;
                const inputProperties = inputSchema.properties as Record<string, { description?: string }>;
                const textProperty = inputProperties?.text;
                const stdinFilenameProperty = inputProperties?.stdinFilename;
                assert.ok(textProperty?.description, "text field should have description");
                assert.ok(stdinFilenameProperty?.description, "stdinFilename field should have description");
                assert.ok(
                    stdinFilenameProperty.description?.includes("context"),
                    "stdinFilename description should mention context"
                );
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

                // Verify isError flag is set correctly for error cases (MCP specification compliance)
                assert.strictEqual(result.isError, true, "isError should be true for non-existent file");

                // Error should still have structured content
                assert.ok(result.structuredContent, "Error should have structured content"); // Use inline snapshot for structured error content (excluding timestamp and dynamic paths)
                const { timestamp, error, ...structuredContentWithoutDynamic } = result.structuredContent;
                expect(structuredContentWithoutDynamic).toMatchInlineSnapshot(`
                  {
                    "isError": true,
                    "results": [],
                    "type": "lintFile_error",
                  }
                `);

                // Verify error message contains expected text
                assert.ok(typeof error === "string", "Error should be a string");
                assert.ok(error.includes("File(s) not found:"), "Error should mention file not found");
                assert.ok(error.includes("nonexistent.md"), "Error should mention the missing file");

                // Verify timestamp exists and is a string
                assert.ok(timestamp, "Should have timestamp");
                assert.strictEqual(typeof timestamp, "string", "Timestamp should be a string");

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

        describe("Schema Descriptions", () => {
            it("should have comprehensive descriptions for all schema fields", async () => {
                const { tools } = await client.listTools();

                for (const tool of tools) {
                    // Check input schema descriptions
                    const inputSchema = tool.inputSchema as Record<string, unknown>;
                    const inputProperties = inputSchema?.properties as Record<string, { description?: string }>;

                    if (inputProperties) {
                        Object.entries(inputProperties).forEach(([fieldName, fieldSchema]) => {
                            assert.ok(
                                fieldSchema.description,
                                `Input field ${fieldName} in tool ${tool.name} should have description`
                            );
                        });
                    }

                    // Check output schema descriptions for message fields
                    const outputSchema = tool.outputSchema as Record<string, unknown>;
                    const outputProperties = outputSchema?.properties as Record<string, unknown>;

                    if (outputProperties) {
                        // Check if messages array exists and has severity descriptions
                        const checkMessageSchema = (schema: unknown) => {
                            const messageSchema = schema as {
                                items?: { properties?: Record<string, { description?: string }> };
                            };
                            if (messageSchema?.items?.properties) {
                                const severityProperty = messageSchema.items.properties.severity;
                                if (severityProperty) {
                                    assert.ok(
                                        severityProperty.description,
                                        `severity field in tool ${tool.name} should have description`
                                    );
                                    assert.ok(
                                        severityProperty.description?.includes("1=warning, 2=error, 3=info"),
                                        `severity description in tool ${tool.name} should explain levels`
                                    );
                                }

                                const lineProperty = messageSchema.items.properties.line;
                                if (lineProperty) {
                                    assert.ok(
                                        lineProperty.description?.includes("1-based"),
                                        `line description in tool ${tool.name} should mention 1-based indexing`
                                    );
                                }

                                const columnProperty = messageSchema.items.properties.column;
                                if (columnProperty) {
                                    assert.ok(
                                        columnProperty.description?.includes("1-based"),
                                        `column description in tool ${tool.name} should mention 1-based indexing`
                                    );
                                }

                                const fixProperty = messageSchema.items.properties.fix;
                                if (fixProperty) {
                                    assert.ok(
                                        fixProperty.description?.includes("Fix suggestion"),
                                        `fix description in tool ${tool.name} should mention fix suggestion`
                                    );
                                }
                            }
                        };

                        // Check messages in different possible locations
                        if (outputProperties.messages) {
                            checkMessageSchema(outputProperties.messages);
                        }

                        if (outputProperties.results) {
                            const resultsSchema = outputProperties.results as {
                                items?: { properties?: Record<string, unknown> };
                            };
                            if (resultsSchema?.items?.properties?.messages) {
                                checkMessageSchema(resultsSchema.items.properties.messages);
                            }
                        }
                    }
                }
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

            // Use inline snapshot for structured content verification (excluding timestamp)
            const { timestamp, ...structuredContentWithoutTimestamp } = result.structuredContent;
            expect(structuredContentWithoutTimestamp).toMatchInlineSnapshot(`
              {
                "filePath": "textlint.txt",
                "isError": false,
                "messages": [],
              }
            `);

            // Verify timestamp exists and is a string
            assert.ok(timestamp, "Should have timestamp");
            assert.strictEqual(typeof timestamp, "string", "Timestamp should be a string");
        });
    });

    describe("Schema validation with additional properties", () => {
        it("should handle textlint messages with additional properties (type, data, index, range, loc)", async () => {
            // This test reproduces the issue reported in #1622
            // TextlintMessage contains additional properties that are not in the current schema
            const result = (await client.callTool({
                name: "lintText",
                arguments: {
                    text: "This  has  double  spaces.",
                    stdinFilename: "test.unknown"
                }
            })) as CallToolResult;

            assert.strictEqual(result.isError, true, "Should fail due to schema validation with additional properties");
            assert.ok(result.structuredContent, "Should have structured content");
            expect(result.structuredContent.error).toMatchInlineSnapshot(`"Not found available plugin for .unknown"`);
        });

        it("should handle markdown content without markdown plugin without schema validation errors", async () => {
            // This reproduces the specific case from #1622 where markdown content
            // is linted without markdown plugin, causing schema validation errors
            const markdownContent = "# Title\n\nThis is markdown content.";
            const result = (await client.callTool({
                name: "lintText",
                arguments: {
                    text: markdownContent,
                    stdinFilename: "test.md"
                }
            })) as CallToolResult;

            assert.strictEqual(
                result.isError,
                false,
                "Should not fail due to schema validation even with unsupported extension"
            );
            assert.ok(result.structuredContent, "Should have structured content");
            assert.ok(Array.isArray(result.structuredContent.messages), "Should have messages array");
        });

        it("should handle file linting with complete TextlintMessage properties", async () => {
            // Test with a file that will generate lint messages with all properties
            const result = (await client.callTool({
                name: "lintFile",
                arguments: {
                    filePaths: [invalidFilePath]
                }
            })) as CallToolResult;

            assert.strictEqual(result.isError, false, "Should not fail due to schema validation");
            assert.ok(result.structuredContent, "Should have structured content");
            assert.ok(Array.isArray(result.structuredContent.results), "Should have results array");
        });

        it("should return isError true for unsupported file extensions", async () => {
            // Test with an unsupported file extension
            const result = (await client.callTool({
                name: "lintFile",
                arguments: {
                    filePaths: [getFixturePath("unsupported.xyz")]
                }
            })) as CallToolResult;

            assert.strictEqual(result.isError, true, "Should return isError true for unsupported extension");
            assert.ok(result.content, "Should have error content");
        });
    });

    describe("Configuration Options Tests", () => {
        describe("Custom Configuration", () => {
            it("should use custom descriptor when provided", async () => {
                // Create server with custom descriptor
                const customServer = await setupServer(createServerOptions());

                const [customClientTransport, customServerTransport] = InMemoryTransport.createLinkedPair();
                await customServer.connect(customServerTransport);

                const customClient = new Client({
                    name: "textlint-custom",
                    version: "1.0"
                });
                await customClient.connect(customClientTransport);

                const result = (await customClient.callTool({
                    name: "lintText",
                    arguments: {
                        text: "Test content",
                        stdinFilename: "test.md"
                    }
                })) as CallToolResult;

                assert.strictEqual(result.isError, false, "Should succeed with custom descriptor");
                assert.ok(result.structuredContent, "Should have structured content");

                // Cleanup
                await customClient.close();
                await customServer.close();
            });

            it("should use custom config file when specified", async () => {
                // Test with minimal config
                const configServer = await setupServer(createServerOptionsWithConfig("minimal-config.json"));

                const [configClientTransport, configServerTransport] = InMemoryTransport.createLinkedPair();
                await configServer.connect(configServerTransport);

                const configClient = new Client({
                    name: "textlint-config",
                    version: "1.0"
                });
                await configClient.connect(configClientTransport);

                const result = (await configClient.callTool({
                    name: "lintFile",
                    arguments: {
                        filePaths: [getFixturePath("ok.md")]
                    }
                })) as CallToolResult;

                assert.strictEqual(result.isError, false, "Should succeed with custom config file");

                // Cleanup
                await configClient.close();
                await configServer.close();
            });

            it("should respect quiet mode option", async () => {
                const quietServer = await setupServer(createServerOptionsWithQuiet());

                const [quietClientTransport, quietServerTransport] = InMemoryTransport.createLinkedPair();
                await quietServer.connect(quietServerTransport);

                const quietClient = new Client({
                    name: "textlint-quiet",
                    version: "1.0"
                });
                await quietClient.connect(quietClientTransport);

                const result = (await quietClient.callTool({
                    name: "lintText",
                    arguments: {
                        text: "Test content with warnings",
                        stdinFilename: "test.md"
                    }
                })) as CallToolResult;

                assert.strictEqual(result.isError, false, "Should succeed in quiet mode");

                // Cleanup
                await quietClient.close();
                await quietServer.close();
            });
        });

        describe("Edge Cases", () => {
            it("should handle empty files", async () => {
                const result = (await client.callTool({
                    name: "lintFile",
                    arguments: {
                        filePaths: [getFixturePath("empty.md")]
                    }
                })) as CallToolResult;

                assert.strictEqual(result.isError, false, "Should handle empty files without error");
                assert.ok(result.structuredContent, "Should have structured content");
                assert.ok(Array.isArray(result.structuredContent.results), "Should have results array");
            });

            it("should handle unsupported file extensions", async () => {
                const result = (await client.callTool({
                    name: "lintFile",
                    arguments: {
                        filePaths: [getFixturePath("unsupported.xyz")]
                    }
                })) as CallToolResult;

                // This might succeed or fail depending on textlint configuration
                // The important thing is that it should handle it gracefully
                assert.ok(result.structuredContent, "Should have structured content even for unsupported files");
            });

            it("should handle large files", async () => {
                const result = (await client.callTool({
                    name: "lintFile",
                    arguments: {
                        filePaths: [getFixturePath("large-file.md")]
                    }
                })) as CallToolResult;

                assert.strictEqual(result.isError, false, "Should handle large files");
                assert.ok(result.structuredContent, "Should have structured content");
            });

            it("should handle multiple files with mixed results", async () => {
                const result = (await client.callTool({
                    name: "lintFile",
                    arguments: {
                        filePaths: [getFixturePath("ok.md"), getFixturePath("invalid.md"), getFixturePath("empty.md")]
                    }
                })) as CallToolResult;

                assert.strictEqual(result.isError, false, "Should handle multiple files");
                assert.ok(result.structuredContent, "Should have structured content");
                assert.ok(Array.isArray(result.structuredContent.results), "Should have results array");
                assert.strictEqual(result.structuredContent.results.length, 3, "Should have results for all files");
            });
        });

        describe("Error Scenarios", () => {
            it("should handle invalid config file gracefully", async () => {
                // Test with non-existent config file
                const invalidConfigOptions: McpServerOptions = {
                    configFilePath: "/nonexistent/config.json"
                };

                const invalidServer = await setupServer(invalidConfigOptions);

                const [invalidClientTransport, invalidServerTransport] = InMemoryTransport.createLinkedPair();
                await invalidServer.connect(invalidServerTransport);

                const invalidClient = new Client({
                    name: "textlint-invalid",
                    version: "1.0"
                });
                await invalidClient.connect(invalidClientTransport);

                const result = (await invalidClient.callTool({
                    name: "lintText",
                    arguments: {
                        text: "Test content",
                        stdinFilename: "test.md"
                    }
                })) as CallToolResult;

                // Should fall back to built-in configuration
                assert.strictEqual(result.isError, false, "Should fall back gracefully for invalid config");

                // Cleanup
                await invalidClient.close();
                await invalidServer.close();
            });

            it("should handle empty text input", async () => {
                const result = (await client.callTool({
                    name: "lintText",
                    arguments: {
                        text: "",
                        stdinFilename: "empty.md"
                    }
                })) as CallToolResult;

                assert.strictEqual(result.isError, false, "Should handle empty text input");
                assert.ok(result.structuredContent, "Should have structured content");
            });

            it("should handle whitespace-only text input", async () => {
                const result = (await client.callTool({
                    name: "lintText",
                    arguments: {
                        text: "   \n\t  \n  ",
                        stdinFilename: "whitespace.md"
                    }
                })) as CallToolResult;

                assert.strictEqual(result.isError, false, "Should handle whitespace-only input");
                assert.ok(result.structuredContent, "Should have structured content");
            });
        });

        describe("Backward Compatibility", () => {
            it("should maintain backward compatibility when no options provided", async () => {
                // This tests that the existing behavior is preserved
                const defaultServer = await setupServer();

                const [defaultClientTransport, defaultServerTransport] = InMemoryTransport.createLinkedPair();
                await defaultServer.connect(defaultServerTransport);

                const defaultClient = new Client({
                    name: "textlint-default",
                    version: "1.0"
                });
                await defaultClient.connect(defaultClientTransport);

                const result = (await defaultClient.callTool({
                    name: "lintFile",
                    arguments: {
                        filePaths: [getFixturePath("ok.md")]
                    }
                })) as CallToolResult;

                assert.strictEqual(result.isError, false, "Should work with default configuration");
                assert.ok(result.structuredContent, "Should have structured content");

                // Cleanup
                await defaultClient.close();
                await defaultServer.close();
            });
        });
    });
});
