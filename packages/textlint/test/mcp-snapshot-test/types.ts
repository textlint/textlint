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

// Test snapshot input (for JSON format)
export type SnapshotInput = {
    description: string;
    serverOptions?: McpServerOptions;
    request: McpToolRequest;
    // Optional files referenced in the request (relative to snapshot directory)
    files?: Record<string, string>;
};

// Test snapshot input factory function (for TypeScript format)
export type SnapshotInputFactory = (context: SnapshotContext) => SnapshotInput;

// Context provided to input.ts files for dynamic path resolution
export type SnapshotContext = {
    // Absolute path to the test snapshot directory
    snapshotDir: string;
    // Absolute path to fake rule modules directory
    ruleModulesDir: string;
    // Absolute path to test directory
    testDir: string;
};

// Test snapshot output (normalized)
export type SnapshotOutput = {
    isError: boolean;
    content?: unknown;
    structuredContent?: unknown;
};
