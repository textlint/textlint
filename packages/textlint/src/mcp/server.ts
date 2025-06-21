import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import pkgConf from "read-pkg-up";
import { createLinter, loadTextlintrc, type CreateLinterOptions } from "../index.js";
import { existsSync } from "node:fs";

const version = pkgConf.sync({ cwd: __dirname }).pkg.version;
const server = new McpServer({
    name: "textlint",
    version
});

const makeLinterOptions = async (): Promise<CreateLinterOptions> => {
    const descriptor = await loadTextlintrc();
    return {
        descriptor
    };
};

server.registerTool(
    "lintFile",
    {
        description: "Lint files using textlint",
        inputSchema: {
            filePaths: z.array(z.string().min(1)).nonempty()
        },
        outputSchema: {
            results: z.array(
                z.object({
                    filePath: z.string(),
                    messages: z.array(
                        z.object({
                            ruleId: z.string().optional(),
                            message: z.string(),
                            line: z.number(),
                            column: z.number(),
                            severity: z.number(),
                            fix: z
                                .object({
                                    range: z.array(z.number()),
                                    text: z.string()
                                })
                                .optional()
                        })
                    ),
                    output: z.string().optional()
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
            // Phase 1: Check if files exist before processing
            const nonExistentFiles = filePaths.filter((filePath) => !existsSync(filePath));
            if (nonExistentFiles.length > 0) {
                const structuredContent = {
                    results: [],
                    error: `File(s) not found: ${nonExistentFiles.join(", ")}`,
                    type: "lintFile_error",
                    timestamp: new Date().toISOString(),
                    isError: true
                };

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: JSON.stringify(structuredContent, null, 2)
                        }
                    ],
                    structuredContent,
                    isError: true
                };
            }

            const linterOptions = await makeLinterOptions();
            const linter = createLinter(linterOptions);

            const results = await linter.lintFiles(filePaths);

            const structuredContent = {
                results,
                isError: false,
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
                isError: false
            };
        } catch (error) {
            // Phase 1: Handle errors with isError flag
            const structuredContent = {
                results: [],
                error: error instanceof Error ? error.message : "Unknown error occurred",
                type: "lintFile_error",
                timestamp: new Date().toISOString(),
                isError: true
            };

            return {
                content: [
                    {
                        type: "text" as const,
                        text: JSON.stringify(structuredContent, null, 2)
                    }
                ],
                structuredContent,
                isError: true
            };
        }
    }
);

server.registerTool(
    "lintText",
    {
        description: "Lint text using textlint",
        inputSchema: {
            text: z.string().nonempty(),
            stdinFilename: z.string().nonempty()
        },
        outputSchema: {
            filePath: z.string(),
            messages: z.array(
                z.object({
                    ruleId: z.string().optional(),
                    message: z.string(),
                    line: z.number(),
                    column: z.number(),
                    severity: z.number(),
                    fix: z
                        .object({
                            range: z.array(z.number()),
                            text: z.string()
                        })
                        .optional()
                })
            ),
            output: z.string().optional(),
            isError: z.boolean(),
            timestamp: z.string().optional(),
            error: z.string().optional(),
            type: z.string().optional()
        }
    },
    async ({ text, stdinFilename }) => {
        try {
            // Phase 1: Validate input parameters
            if (!stdinFilename.trim()) {
                const structuredContent = {
                    filePath: stdinFilename,
                    messages: [],
                    error: "stdinFilename cannot be empty",
                    type: "lintText_error",
                    timestamp: new Date().toISOString(),
                    isError: true
                };

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: JSON.stringify(structuredContent, null, 2)
                        }
                    ],
                    structuredContent,
                    isError: true
                };
            }

            const linterOptions = await makeLinterOptions();
            const linter = createLinter(linterOptions);

            const result = await linter.lintText(text, stdinFilename);

            // Phase 1: Return structured content with both content and structuredContent
            const structuredContent = {
                ...result,
                isError: false,
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
                isError: false
            };
        } catch (error) {
            const structuredContent = {
                filePath: stdinFilename,
                messages: [],
                error: error instanceof Error ? error.message : "Unknown error occurred",
                type: "lintText_error",
                timestamp: new Date().toISOString(),
                isError: true
            };

            return {
                content: [
                    {
                        type: "text" as const,
                        text: JSON.stringify(structuredContent, null, 2)
                    }
                ],
                structuredContent,
                isError: true
            };
        }
    }
);

server.registerTool(
    "getLintFixedFileContent",
    {
        description: "Get lint-fixed content of files using textlint",
        inputSchema: {
            filePaths: z.array(z.string().min(1)).nonempty()
        },
        outputSchema: {
            results: z.array(
                z.object({
                    filePath: z.string(),
                    messages: z.array(
                        z.object({
                            ruleId: z.string().optional(),
                            message: z.string(),
                            line: z.number(),
                            column: z.number(),
                            severity: z.number(),
                            fix: z
                                .object({
                                    range: z.array(z.number()),
                                    text: z.string()
                                })
                                .optional()
                        })
                    ),
                    output: z.string().optional()
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
            // Phase 1: Check if files exist before processing
            const nonExistentFiles = filePaths.filter((filePath) => !existsSync(filePath));
            if (nonExistentFiles.length > 0) {
                const structuredContent = {
                    results: [],
                    error: `File(s) not found: ${nonExistentFiles.join(", ")}`,
                    type: "fixFiles_error",
                    timestamp: new Date().toISOString(),
                    isError: true
                };

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: JSON.stringify(structuredContent, null, 2)
                        }
                    ],
                    structuredContent,
                    isError: true
                };
            }

            const linterOptions = await makeLinterOptions();
            const linter = createLinter(linterOptions);

            const results = await linter.fixFiles(filePaths);

            // Phase 1: Return structured content with both content and structuredContent
            const structuredContent = {
                results,
                isError: false,
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
                isError: false
            };
        } catch (error) {
            // Phase 1: Handle errors with isError flag
            const structuredContent = {
                results: [],
                error: error instanceof Error ? error.message : "Unknown error occurred",
                type: "fixFiles_error",
                timestamp: new Date().toISOString(),
                isError: true
            };

            return {
                content: [
                    {
                        type: "text" as const,
                        text: JSON.stringify(structuredContent, null, 2)
                    }
                ],
                structuredContent,
                isError: true
            };
        }
    }
);
server.registerTool(
    "getLintFixedTextContent",
    {
        description: "Get lint-fixed content of text using textlint",
        inputSchema: {
            text: z.string().nonempty(),
            stdinFilename: z.string().nonempty()
        },
        outputSchema: {
            filePath: z.string(),
            messages: z.array(
                z.object({
                    ruleId: z.string().optional(),
                    message: z.string(),
                    line: z.number(),
                    column: z.number(),
                    severity: z.number(),
                    fix: z
                        .object({
                            range: z.array(z.number()),
                            text: z.string()
                        })
                        .optional()
                })
            ),
            output: z.string().optional(),
            isError: z.boolean(),
            timestamp: z.string().optional(),
            error: z.string().optional(),
            type: z.string().optional()
        }
    },
    async ({ text, stdinFilename }) => {
        try {
            // Phase 1: Validate input parameters
            if (!stdinFilename.trim()) {
                const structuredContent = {
                    filePath: stdinFilename,
                    messages: [],
                    error: "stdinFilename cannot be empty",
                    type: "fixText_error",
                    timestamp: new Date().toISOString(),
                    isError: true
                };

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: JSON.stringify(structuredContent, null, 2)
                        }
                    ],
                    structuredContent,
                    isError: true
                };
            }

            const linterOptions = await makeLinterOptions();
            const linter = createLinter(linterOptions);

            const result = await linter.fixText(text, stdinFilename);

            // Phase 1: Return structured content with both content and structuredContent
            const structuredContent = {
                ...result,
                isError: false,
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
                isError: false
            };
        } catch (error) {
            // Phase 1: Handle errors with isError flag
            const structuredContent = {
                filePath: stdinFilename,
                messages: [],
                error: error instanceof Error ? error.message : "Unknown error occurred",
                type: "fixText_error",
                timestamp: new Date().toISOString(),
                isError: true
            };

            return {
                content: [
                    {
                        type: "text" as const,
                        text: JSON.stringify(structuredContent, null, 2)
                    }
                ],
                structuredContent,
                isError: true
            };
        }
    }
);

const connectStdioMcpServer = async () => {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    return server;
};

export { connectStdioMcpServer, server };
