import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import {
    McpResponse,
    McpToolRequest,
    SnapshotContext,
    SnapshotInput,
    SnapshotInputFactory,
    SnapshotOutput
} from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const SNAPSHOTS_DIRECTORY = path.join(__dirname, "snapshots");
export const FAKE_MODULES_DIRECTORY = path.join(__dirname, "..", "mcp", "fixtures", "rule_modules");

/**
 * Normalize MCP response for snapshot comparison
 * Removes timestamps and dynamic paths
 */
export function normalizeResponse(response: McpResponse, snapshotDir: string): SnapshotOutput {
    const normalized = JSON.parse(JSON.stringify(response, pathReplacer(snapshotDir)));

    // Remove timestamps
    if (normalized.content) {
        normalized.content = removeTimestamps(normalized.content);
    }
    if (normalized.structuredContent) {
        normalized.structuredContent = removeTimestamps(normalized.structuredContent);
        // Also normalize paths in structured content using test case name
        const testCaseName = path.basename(snapshotDir);
        normalized.structuredContent = normalizeStructuredPaths(
            normalized.structuredContent,
            snapshotDir,
            testCaseName
        );
    }

    return normalized;
}

/**
 * Replace dynamic paths with placeholders for deterministic snapshots
 */
function pathReplacer(snapshotDir: string) {
    return function replacer(_key: string, value: unknown): unknown {
        if (typeof value === "string") {
            let stringValue = value;

            // Replace timestamps first
            stringValue = stringValue.replace(/"timestamp":\s*"[^"]*"/g, '"timestamp": "<timestamp>"');

            // Use simple string operations instead of regex for path replacement
            // This is more reliable across platforms

            // Extract test case name from snapshot directory
            const testCaseName = path.basename(snapshotDir);

            // Define path patterns to replace with simpler placeholders
            const pathReplacements = [
                {
                    // 1. Files within snapshot directory -> <test-case>/filename
                    checkPaths: [snapshotDir, normalizePath(snapshotDir)],
                    replacement: `<${testCaseName}>`
                },
                {
                    // 2. Rule modules directory -> <rule_modules>
                    checkPaths: [FAKE_MODULES_DIRECTORY, normalizePath(FAKE_MODULES_DIRECTORY)],
                    replacement: "<rule_modules>"
                },
                {
                    // 4. Working directory -> <cwd> (fallback)
                    checkPaths: [process.cwd(), normalizePath(process.cwd())],
                    replacement: "<cwd>"
                }
            ];

            // Try each replacement pattern
            for (const { checkPaths, replacement } of pathReplacements) {
                let wasReplaced = false;

                for (const pathToCheck of checkPaths) {
                    /**
                     * input: "C:\\path\\to\\file.txt"
                     * output: "C:\\\\path\\\\to\\\\file.txt"
                     * @param filePath
                     */
                    const jsonStringifyValue = (filePath: string) => {
                        // only filePath value
                        return JSON.stringify(JSON.stringify(filePath)).replaceAll(`\\"`, "").replaceAll(`"`, "");
                    };
                    const jsonifiedPathToCheck = jsonStringifyValue(pathToCheck);
                    const jsonifiedReplacement = jsonStringifyValue(replacement);
                    if (stringValue.includes(pathToCheck) || stringValue.includes(jsonifiedPathToCheck)) {
                        // For snapshot files, use simple test-case/filename format
                        // Replace with <test-case>/filename format
                        stringValue = stringValue.replaceAll(pathToCheck, replacement);
                        stringValue = stringValue.replaceAll(jsonifiedPathToCheck, jsonifiedReplacement);
                        // windows path sep to forward slash
                        stringValue = stringValue.replace(/\\/g, "/");
                        wasReplaced = true;
                        break;
                    }
                }

                if (wasReplaced) break;
            }

            return stringValue;
        }
        return value;
    };
}

/**
 * Normalize paths in structured content
 */
function normalizeStructuredPaths(obj: unknown, snapshotDir: string, testCaseName: string): unknown {
    if (Array.isArray(obj)) {
        return obj.map((item) => normalizeStructuredPaths(item, snapshotDir, testCaseName));
    } else if (obj && typeof obj === "object") {
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
            if (key === "filePath" && typeof value === "string") {
                // Normalize filePath to <test-case>/filename format
                let normalizedPath = value;

                // Try direct replacement with snapshot directory first
                if (normalizedPath.includes(snapshotDir)) {
                    const relativePath = path.relative(snapshotDir, normalizedPath);
                    if (relativePath && !relativePath.startsWith("..") && !path.isAbsolute(relativePath)) {
                        normalizedPath = `<${testCaseName}>/${relativePath.replace(/\\/g, "/")}`;
                    }
                } else if (normalizedPath.includes("snapshots")) {
                    // Fallback: extract from path structure
                    const parts = normalizedPath.split(/[\/\\]/);
                    const snapshotIndex = parts.findIndex((part) => part === "snapshots");
                    if (snapshotIndex >= 0 && snapshotIndex < parts.length - 2) {
                        const caseName = parts[snapshotIndex + 1];
                        const fileName = parts[snapshotIndex + 2];
                        normalizedPath = `<${caseName}>/${fileName}`;
                    }
                }

                result[key] = normalizedPath;
            } else {
                result[key] = normalizeStructuredPaths(value, snapshotDir, testCaseName);
            }
        }
        return result;
    }
    return obj;
}

/**
 * Remove timestamps from response objects
 */
function removeTimestamps(obj: unknown): unknown {
    if (Array.isArray(obj)) {
        return obj.map(removeTimestamps);
    } else if (obj && typeof obj === "object") {
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
            // Skip timestamp fields
            if (key === "timestamp") {
                result[key] = "<timestamp>";
            } else {
                result[key] = removeTimestamps(value);
            }
        }
        return result;
    }
    return obj;
}

/**
 * Normalize file paths for cross-platform compatibility
 */
function normalizePath(value: string): string {
    // Convert backslashes to forward slashes for Windows compatibility
    let normalized = value.replace(/\\/g, "/");

    // Handle Windows drive letters (C:/ -> /c/)
    if (/^[A-Za-z]:\//.test(normalized)) {
        normalized = `/${normalized.toLowerCase()}`;
    }

    return normalized;
}

/**
 * Read input.json or input.ts from snapshot directory
 */
export async function readSnapshotInput(snapshotDir: string): Promise<SnapshotInput> {
    // Try input.ts first (preferred)
    const inputTsPath = path.join(snapshotDir, "input.ts");
    if (fs.existsSync(inputTsPath)) {
        return await readSnapshotInputFromTs(snapshotDir);
    }

    // Fallback to input.json
    const inputJsonPath = path.join(snapshotDir, "input.json");
    if (fs.existsSync(inputJsonPath)) {
        const content = fs.readFileSync(inputJsonPath, "utf-8");
        return JSON.parse(content) as SnapshotInput;
    }

    throw new Error(`Neither input.ts nor input.json found in ${snapshotDir}`);
}

/**
 * Read and execute input.ts to get SnapshotInput
 */
async function readSnapshotInputFromTs(snapshotDir: string): Promise<SnapshotInput> {
    const inputTsPath = path.join(snapshotDir, "input.ts");

    // Create context for the input.ts file
    const context: SnapshotContext = {
        snapshotDir,
        ruleModulesDir: FAKE_MODULES_DIRECTORY,
        testDir: __dirname
    };

    try {
        // Import the input.ts file
        const inputModule = await import(inputTsPath);

        // The input.ts should export either a default function or a SnapshotInput object
        if (typeof inputModule.default === "function") {
            const factory = inputModule.default as SnapshotInputFactory;
            return factory(context);
        } else if (inputModule.default && typeof inputModule.default === "object") {
            return inputModule.default as SnapshotInput;
        } else {
            throw new Error(
                `input.ts must export either a function(context) => SnapshotInput or a SnapshotInput object`
            );
        }
    } catch (error) {
        throw new Error(`Failed to load input.ts from ${snapshotDir}: ${error}`);
    }
}

/**
 * Read expected output.json from snapshot directory
 */
export function readSnapshotOutput(snapshotDir: string): SnapshotOutput {
    const outputPath = path.join(snapshotDir, "output.json");
    if (!fs.existsSync(outputPath)) {
        throw new Error(`output.json not found in ${snapshotDir}`);
    }

    const content = fs.readFileSync(outputPath, "utf-8");
    return JSON.parse(content) as SnapshotOutput;
}

/**
 * Write snapshot output (for updating snapshots)
 */
export function writeSnapshotOutput(snapshotDir: string, output: SnapshotOutput): void {
    const outputPath = path.join(snapshotDir, "output.json");
    fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
}

/**
 * Resolve file paths in request relative to snapshot directory
 */
export function resolveRequestPaths(request: unknown, snapshotDir: string): McpToolRequest {
    const resolved = JSON.parse(JSON.stringify(request)) as Record<string, unknown>;

    if (resolved.arguments && typeof resolved.arguments === "object") {
        const args = resolved.arguments as Record<string, unknown>;
        // Resolve filePaths if present
        if (args.filePaths && Array.isArray(args.filePaths)) {
            args.filePaths = args.filePaths.map((filePath) => {
                if (typeof filePath === "string" && path.isAbsolute(filePath)) {
                    return filePath;
                }
                return path.join(snapshotDir, String(filePath));
            });
        }
    }

    return resolved as McpToolRequest;
}

/**
 * Check if UPDATE_SNAPSHOT environment variable is set
 */
export function shouldUpdateSnapshots(): boolean {
    return Boolean(process.env.UPDATE_SNAPSHOT);
}
