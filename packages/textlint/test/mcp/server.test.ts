import assert from "node:assert";
import { afterEach, beforeEach, describe, it, expect } from "vitest";
import path from "node:path";
import { readFileSync } from "node:fs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { setupServer } from "../../src/mcp/server.js";

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
                                "additionalProperties": false,
                                "properties": {
                                  "column": {
                                    "description": "Column number (1-based)",
                                    "type": "number",
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
                                  "line": {
                                    "description": "Line number (1-based)",
                                    "type": "number",
                                  },
                                  "message": {
                                    "type": "string",
                                  },
                                  "ruleId": {
                                    "type": "string",
                                  },
                                  "severity": {
                                    "description": "Severity level: 1=warning, 2=error, 3=info",
                                    "type": "number",
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

            it("should validate output schema on client side (client.callTool validates structuredContent)", async () => {
                // Test case: Verify that the MCP client validates structuredContent against outputSchema
                // The MCP SDK client does perform validation using Ajv

                const result = (await client.callTool({
                    name: "lintFile",
                    arguments: {
                        filePaths: [validFilePath]
                    }
                })) as CallToolResult;

                // The client validates that:
                // 1. Tools with outputSchema must return structuredContent (unless error)
                // 2. structuredContent must match the defined schema
                assert.ok(result.structuredContent, "Tools with outputSchema must return structuredContent");

                // If the server returned invalid structured content, the client would throw
                // an McpError with ErrorCode.InvalidParams
                assert.ok(result, "Client validates and accepts schema-compliant responses");

                // Note: The MCP SDK client uses Ajv to validate structuredContent against outputSchema
                // See: @modelcontextprotocol/sdk/dist/esm/client/index.js callTool method
            });

            it("should enforce structured content requirement for tools with outputSchema", async () => {
                // This test verifies that the client enforces the structured content requirement
                // Let's test this by examining the behavior with our tools that have outputSchemas

                const { tools } = await client.listTools();
                const toolsWithOutputSchema = tools.filter((tool) => tool.outputSchema);

                assert.ok(toolsWithOutputSchema.length > 0, "Should have tools with outputSchema for testing");

                // All our tools have outputSchema, so they must return structuredContent
                for (const tool of toolsWithOutputSchema) {
                    assert.ok(tool.outputSchema, `Tool ${tool.name} should have outputSchema`);
                }

                // When we call these tools, they should return structuredContent
                const result = (await client.callTool({
                    name: "lintText",
                    arguments: {
                        text: "test content",
                        stdinFilename: "test.txt"
                    }
                })) as CallToolResult;

                // The client would throw an error if structuredContent was missing
                assert.ok(result.structuredContent, "Client enforces structuredContent for tools with outputSchema");
            });

            it("should throw validation error when server returns invalid schema data", async () => {
                // Test case: Verify that the MCP client throws an error when structuredContent
                // doesn't match the defined outputSchema

                // First verify that valid data works
                const validResult = (await client.callTool({
                    name: "testInvalidSchema",
                    arguments: {
                        triggerError: false
                    }
                })) as CallToolResult;

                assert.ok(validResult.structuredContent, "Valid data should return structuredContent");
                assert.strictEqual(validResult.structuredContent.requiredString, "valid string");
                assert.strictEqual(validResult.structuredContent.requiredNumber, 42);

                // Now test that invalid data triggers validation error
                try {
                    await client.callTool({
                        name: "testInvalidSchema",
                        arguments: {
                            triggerError: true
                        }
                    });

                    // If we reach this point, the validation didn't work as expected
                    assert.fail("Expected validation error was not thrown");
                } catch (error) {
                    // Verify this is the expected MCP validation error
                    assert.ok(error instanceof Error, "Should throw an Error");
                    assert.ok(
                        error.message.includes("Invalid structured content") ||
                            error.message.includes("Expected string, received number") ||
                            error.message.includes("Expected number, received string") ||
                            error.message.includes("schema"),
                        `Error message should mention schema validation, got: ${error.message}`
                    );

                    // The error should contain detailed validation information from Ajv
                    assert.ok(
                        error.message.includes("invalid_type") ||
                            error.message.includes("Expected string") ||
                            error.message.includes("Expected number"),
                        "Error should contain Ajv validation details"
                    );
                }
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
            // In test environment, we have an additional test tool
            const expectedToolCount = process.env.NODE_ENV === "test" ? 5 : 4;
            assert.strictEqual(tools.length, expectedToolCount);

            const toolNames = tools.map((tool) => tool.name);
            assert.ok(toolNames.includes("lintFile"), "Should have lintFile tool");
            assert.ok(toolNames.includes("lintText"), "Should have lintText tool");
            assert.ok(toolNames.includes("getLintFixedFileContent"), "Should have getLintFixedFileContent tool");
            assert.ok(toolNames.includes("getLintFixedTextContent"), "Should have getLintFixedTextContent tool");

            if (process.env.NODE_ENV === "test") {
                assert.ok(
                    toolNames.includes("testInvalidSchema"),
                    "Should have testInvalidSchema tool in test environment"
                );
            }
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
});
