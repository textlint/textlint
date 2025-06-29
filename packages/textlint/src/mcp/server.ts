import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createLinter, loadTextlintrc, type CreateLinterOptions } from "../index.js";
import { existsSync } from "node:fs";

const makeLinterOptions = async (): Promise<CreateLinterOptions> => {
    const descriptor = await loadTextlintrc();
    return {
        descriptor
    };
};

// Helper functions for common MCP operations
const createStructuredErrorResponse = (error: string, type: string, isError = true) => {
    const structuredContent = {
        results: [],
        error,
        type,
        timestamp: new Date().toISOString(),
        isError
    };

    return {
        content: [
            {
                type: "text" as const,
                text: JSON.stringify(structuredContent, null, 2)
            }
        ],
        structuredContent,
        isError
    };
};

const createStructuredSuccessResponse = (data: Record<string, unknown> | object, isError = false) => {
    const structuredContent = {
        ...data,
        isError,
        timestamp: new Date().toISOString()
    };

    return {
        content: [
            {
                type: "text" as const,
                text: JSON.stringify(structuredContent, null, 2)
            }
        ],
        structuredContent,
        isError
    };
};

const checkFilesExist = (filePaths: string[]) => {
    return filePaths.filter((filePath) => !existsSync(filePath));
};

const validateInputAndReturnError = (value: string, fieldName: string, errorType: string) => {
    if (!value.trim()) {
        return createStructuredErrorResponse(`${fieldName} cannot be empty`, errorType);
    }
    return null;
};

export const setupServer = async (): Promise<McpServer> => {
    const { readPackageUpSync } = await import("read-package-up");
    const version = readPackageUpSync({ cwd: __dirname })?.packageJson.version ?? "unknown";
    const server = new McpServer({
        name: "textlint",
        version
    });

    // ツール登録
    server.registerTool(
        "lintFile",
        {
            description: "Lint files using textlint",
            inputSchema: {
                filePaths: z
                    .array(z.string().min(1).describe("File path to lint"))
                    .nonempty()
                    .describe("Array of file paths to lint")
            },
            outputSchema: {
                results: z.array(
                    z.object({
                        filePath: z.string(),
                        messages: z.array(
                            z.object({
                                ruleId: z.string().optional(),
                                message: z.string(),
                                line: z.number().describe("Line number (1-based)"),
                                column: z.number().describe("Column number (1-based)"),
                                severity: z.number().describe("Severity level: 1=warning, 2=error, 3=info"),
                                fix: z
                                    .object({
                                        range: z.array(z.number()).describe("Text range [start, end] (0-based)"),
                                        text: z.string().describe("Replacement text")
                                    })
                                    .optional()
                                    .describe("Fix suggestion if available")
                            })
                        ),
                        output: z.string().optional().describe("Fixed content if available")
                    })
                ),
                isError: z.boolean(),
                timestamp: z.string().optional(),
                error: z.string().optional(),
                type: z.string().optional()
            }
        },
        async ({ filePaths }) => {
            try {
                // Check if files exist before processing
                const nonExistentFiles = checkFilesExist(filePaths);
                if (nonExistentFiles.length > 0) {
                    return createStructuredErrorResponse(
                        `File(s) not found: ${nonExistentFiles.join(", ")}`,
                        "lintFile_error"
                    );
                }

                const linterOptions = await makeLinterOptions();
                const linter = createLinter(linterOptions);

                const results = await linter.lintFiles(filePaths);

                // Return structured content as per MCP 2025-06-18 specification
                // https://modelcontextprotocol.io/specification/2025-06-18/server/tools#structured-content
                return createStructuredSuccessResponse({ results });
            } catch (error) {
                // Handle errors with isError flag for MCP compliance
                return createStructuredErrorResponse(
                    error instanceof Error ? error.message : "Unknown error occurred",
                    "lintFile_error"
                );
            }
        }
    );

    server.registerTool(
        "lintText",
        {
            description: "Lint text using textlint",
            inputSchema: {
                text: z.string().nonempty().describe("Text content to lint"),
                stdinFilename: z.string().nonempty().describe("Filename for context (e.g., 'stdin.md')")
            },
            outputSchema: {
                filePath: z.string(),
                messages: z.array(
                    z.object({
                        ruleId: z.string().optional(),
                        message: z.string(),
                        line: z.number().describe("Line number (1-based)"),
                        column: z.number().describe("Column number (1-based)"),
                        severity: z.number().describe("Severity level: 1=warning, 2=error, 3=info"),
                        fix: z
                            .object({
                                range: z.array(z.number()).describe("Text range [start, end] (0-based)"),
                                text: z.string().describe("Replacement text")
                            })
                            .optional()
                            .describe("Fix suggestion if available")
                    })
                ),
                output: z.string().optional().describe("Fixed content if available"),
                isError: z.boolean(),
                timestamp: z.string().optional(),
                error: z.string().optional(),
                type: z.string().optional()
            }
        },
        async ({ text, stdinFilename }) => {
            try {
                // Validate input parameters
                const validationError = validateInputAndReturnError(stdinFilename, "stdinFilename", "lintText_error");
                if (validationError) {
                    return validationError;
                }

                const linterOptions = await makeLinterOptions();
                const linter = createLinter(linterOptions);

                const result = await linter.lintText(text, stdinFilename);

                // Return structured content as per MCP 2025-06-18 specification
                // https://modelcontextprotocol.io/specification/2025-06-18/server/tools#structured-content
                return createStructuredSuccessResponse(result);
            } catch (error) {
                return createStructuredErrorResponse(
                    error instanceof Error ? error.message : "Unknown error occurred",
                    "lintText_error"
                );
            }
        }
    );

    server.registerTool(
        "getLintFixedFileContent",
        {
            description: "Get lint-fixed content of files using textlint",
            inputSchema: {
                filePaths: z
                    .array(z.string().min(1).describe("File path to fix"))
                    .nonempty()
                    .describe("Array of file paths to get fixed content for")
            },
            outputSchema: {
                results: z.array(
                    z.object({
                        filePath: z.string(),
                        messages: z.array(
                            z.object({
                                ruleId: z.string().optional(),
                                message: z.string(),
                                line: z.number().describe("Line number (1-based)"),
                                column: z.number().describe("Column number (1-based)"),
                                severity: z.number().describe("Severity level: 1=warning, 2=error, 3=info"),
                                fix: z
                                    .object({
                                        range: z.array(z.number()).describe("Text range [start, end] (0-based)"),
                                        text: z.string().describe("Replacement text")
                                    })
                                    .optional()
                                    .describe("Fix suggestion if available")
                            })
                        ),
                        output: z.string().optional().describe("Fixed content")
                    })
                ),
                isError: z.boolean(),
                timestamp: z.string().optional(),
                error: z.string().optional(),
                type: z.string().optional()
            }
        },
        async ({ filePaths }) => {
            try {
                // Check if files exist before processing
                const nonExistentFiles = checkFilesExist(filePaths);
                if (nonExistentFiles.length > 0) {
                    return createStructuredErrorResponse(
                        `File(s) not found: ${nonExistentFiles.join(", ")}`,
                        "fixFiles_error"
                    );
                }

                const linterOptions = await makeLinterOptions();
                const linter = createLinter(linterOptions);

                const results = await linter.fixFiles(filePaths);

                // Return structured content as per MCP 2025-06-18 specification
                // https://modelcontextprotocol.io/specification/2025-06-18/server/tools#structured-content
                return createStructuredSuccessResponse({ results });
            } catch (error) {
                // Handle errors with isError flag for MCP compliance
                return createStructuredErrorResponse(
                    error instanceof Error ? error.message : "Unknown error occurred",
                    "fixFiles_error"
                );
            }
        }
    );

    server.registerTool(
        "getLintFixedTextContent",
        {
            description: "Get lint-fixed content of text using textlint",
            inputSchema: {
                text: z.string().nonempty().describe("Text content to fix"),
                stdinFilename: z.string().nonempty().describe("Filename for context (e.g., 'stdin.md')")
            },
            outputSchema: {
                filePath: z.string(),
                messages: z.array(
                    z.object({
                        ruleId: z.string().optional(),
                        message: z.string(),
                        line: z.number().describe("Line number (1-based)"),
                        column: z.number().describe("Column number (1-based)"),
                        severity: z.number().describe("Severity level: 1=warning, 2=error, 3=info"),
                        fix: z
                            .object({
                                range: z.array(z.number()).describe("Text range [start, end] (0-based)"),
                                text: z.string().describe("Replacement text")
                            })
                            .optional()
                            .describe("Fix suggestion if available")
                    })
                ),
                output: z.string().optional().describe("Fixed content"),
                isError: z.boolean(),
                timestamp: z.string().optional(),
                error: z.string().optional(),
                type: z.string().optional()
            }
        },
        async ({ text, stdinFilename }) => {
            try {
                // Validate input parameters
                const validationError = validateInputAndReturnError(stdinFilename, "stdinFilename", "fixText_error");
                if (validationError) return validationError;

                const linterOptions = await makeLinterOptions();
                const linter = createLinter(linterOptions);

                const result = await linter.fixText(text, stdinFilename);

                // Return structured content as per MCP 2025-06-18 specification
                // https://modelcontextprotocol.io/specification/2025-06-18/server/tools#structured-content
                return createStructuredSuccessResponse(result);
            } catch (error) {
                // Handle errors with isError flag for MCP compliance
                return createStructuredErrorResponse(
                    error instanceof Error ? error.message : "Unknown error occurred",
                    "fixText_error"
                );
            }
        }
    );

    return server;
};

export const connectStdioMcpServer = async () => {
    const server = await setupServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    return server;
};
