import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createLinter, loadTextlintrc, type CreateLinterOptions } from "../index.js";
import { existsSync } from "node:fs";
import { TextlintMessageSchema } from "./schemas.js";
import { TextlintKernelDescriptor } from "@textlint/kernel";
import debug from "debug";

const mcpDebug = debug("textlint:mcp");

// Define error types as a union type
type TextlintMcpErrorType = "lintFile_error" | "lintText_error" | "fixFiles_error" | "fixText_error";

// Define MCP server options type as specified in the issue
export type McpServerOptions = {
    configFilePath?: string; // Config file path
    node_modulesDir?: string; // Custom node_modules directory
    ignoreFilePath?: string; // .textlintignore file path
    quiet?: boolean; // Report errors only
    debug?: boolean; // Enable debug logging
    cwd?: string; // Current working directory
    descriptor?: TextlintKernelDescriptor; // Direct configuration
};

const makeLinterOptions = async (options: McpServerOptions = {}): Promise<CreateLinterOptions> => {
    // If descriptor is directly provided, use it; otherwise load from config
    const descriptor =
        options.descriptor ||
        (await loadTextlintrc({
            configFilePath: options.configFilePath,
            node_modulesDir: options.node_modulesDir
        }));

    return {
        descriptor,
        ignoreFilePath: options.ignoreFilePath,
        quiet: options.quiet,
        cwd: options.cwd
    };
};

// Helper functions for common MCP operations
const createStructuredErrorResponse = (error: string, type: TextlintMcpErrorType, isError = true) => {
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

const validateInputAndReturnError = (value: string, fieldName: string, errorType: TextlintMcpErrorType) => {
    if (!value.trim()) {
        return createStructuredErrorResponse(`${fieldName} cannot be empty`, errorType);
    }
    return null;
};

export const setupServer = async (options: McpServerOptions = {}): Promise<McpServer> => {
    const { readPackageUpSync } = await import("read-package-up");
    const version = readPackageUpSync({ cwd: __dirname })?.packageJson.version ?? "unknown";

    if (options.debug) {
        mcpDebug("Setting up MCP server with options: %j", options);
        mcpDebug("Server version: %s", version);
    }

    const server = new McpServer({
        name: "textlint",
        version
    });

    if (options.debug) {
        mcpDebug("MCP server initialized successfully");
    }

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
                        messages: z.array(TextlintMessageSchema),
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

                const linterOptions = await makeLinterOptions(options);
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
                messages: z.array(TextlintMessageSchema),
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

                const linterOptions = await makeLinterOptions(options);
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
                        messages: z.array(TextlintMessageSchema),
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

                const linterOptions = await makeLinterOptions(options);
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
                messages: z.array(TextlintMessageSchema),
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

                const linterOptions = await makeLinterOptions(options);
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

export const connectStdioMcpServer = async (options: McpServerOptions = {}) => {
    const server = await setupServer(options);
    const transport = new StdioServerTransport();

    if (options.debug) {
        mcpDebug("Connecting MCP server to stdio transport...");
    }
    await server.connect(transport);
    if (options.debug) {
        mcpDebug("MCP server connected and ready to accept requests");
    }

    return server;
};
