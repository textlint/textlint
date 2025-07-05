import { TextlintKernelDescriptor } from "@textlint/kernel";
import { builtInPlugins } from "../../src/loader/TextlintrcLoader.js";
import { McpServerOptions } from "../../src/mcp/server.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Helper function to create test configuration with custom rules
 */
export const createTestDescriptor = (rules: Record<string, any> = {}): TextlintKernelDescriptor => {
    return new TextlintKernelDescriptor({
        rules: Object.entries(rules).map(([ruleId, options]) => ({
            ruleId,
            rule: () => ({}), // Mock rule implementation
            options
        })),
        filterRules: [],
        plugins: builtInPlugins
    });
};

/**
 * Helper function to get fixture file paths
 */
export const getFixturePath = (filename: string): string => {
    return path.join(__dirname, "fixtures", filename);
};

/**
 * Helper function to get config file paths
 */
export const getConfigPath = (filename: string): string => {
    return path.join(__dirname, "fixtures", "configs", filename);
};

/**
 * Creates MCP server options with custom descriptor
 */
export const createServerOptions = (descriptor?: TextlintKernelDescriptor): McpServerOptions => ({
    descriptor: descriptor || createTestDescriptor()
});

/**
 * Creates MCP server options with config file
 */
export const createServerOptionsWithConfig = (configFileName: string): McpServerOptions => ({
    configFilePath: getConfigPath(configFileName)
});

/**
 * Creates MCP server options with custom working directory
 */
export const createServerOptionsWithCwd = (cwd: string, descriptor?: TextlintKernelDescriptor): McpServerOptions => ({
    cwd,
    descriptor: descriptor || createTestDescriptor()
});

/**
 * Creates MCP server options with quiet mode
 */
export const createServerOptionsWithQuiet = (descriptor?: TextlintKernelDescriptor): McpServerOptions => ({
    quiet: true,
    descriptor: descriptor || createTestDescriptor()
});
