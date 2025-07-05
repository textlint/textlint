import type { McpServerOptions } from "../../src/mcp/server.js";

// MCP tool request types
export type LintFileRequest = {
    name: "lintFile";
    arguments: {
        filePaths: string[];
    };
};

export type LintTextRequest = {
    name: "lintText";
    arguments: {
        text: string;
        stdinFilename: string;
    };
};

export type GetLintFixedFileContentRequest = {
    name: "getLintFixedFileContent";
    arguments: {
        filePaths: string[];
    };
};

export type GetLintFixedTextContentRequest = {
    name: "getLintFixedTextContent";
    arguments: {
        text: string;
        stdinFilename: string;
    };
};

export type McpToolRequest =
    | LintFileRequest
    | LintTextRequest
    | GetLintFixedFileContentRequest
    | GetLintFixedTextContentRequest;

// MCP response types
export type McpResponse = {
    isError: boolean;
    content?: unknown;
    structuredContent?: unknown;
};

// Test case configuration
export type McpTestCase = {
    description?: string;
    serverOptions?: McpServerOptions;
    request: McpToolRequest;
    expectedResponse: McpResponse;
};

// Test snapshot input
export type SnapshotInput = {
    description: string;
    serverOptions?: McpServerOptions;
    request: McpToolRequest;
    // Optional files referenced in the request (relative to snapshot directory)
    files?: Record<string, string>;
};

// Test snapshot output (normalized)
export type SnapshotOutput = {
    isError: boolean;
    content?: unknown;
    structuredContent?: unknown;
};
