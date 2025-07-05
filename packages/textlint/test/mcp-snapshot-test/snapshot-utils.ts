import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import type { McpResponse, SnapshotContext, SnapshotInput, SnapshotInputFactory, SnapshotOutput } from "./types.js";

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
        // Also normalize paths in structured content
        normalized.structuredContent = normalizeStructuredPaths(normalized.structuredContent, snapshotDir);
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

            // Simple string replacement approach - much more reliable across platforms
            // We replace exact path strings to avoid regex complexity

            // 1. Replace snapshot directory paths with <snapshot>/filename
            if (stringValue.includes(snapshotDir)) {
                const relativePath = path.relative(snapshotDir, stringValue);
                if (relativePath && !relativePath.startsWith("..") && !path.isAbsolute(relativePath)) {
                    stringValue = stringValue.replace(new RegExp(escapeRegExp(snapshotDir), "g"), "<snapshot>");
                    stringValue = normalizePath(stringValue);
                }
            }

            // 2. Replace test directory paths
            if (stringValue.includes(__dirname)) {
                stringValue = stringValue.replace(new RegExp(escapeRegExp(__dirname), "g"), "<test-dir>");
                stringValue = normalizePath(stringValue);
            }

            // 3. Replace rule modules directory paths
            if (stringValue.includes(FAKE_MODULES_DIRECTORY)) {
                stringValue = stringValue.replace(
                    new RegExp(escapeRegExp(FAKE_MODULES_DIRECTORY), "g"),
                    "<rule_modules>"
                );
                stringValue = normalizePath(stringValue);
            }

            // 4. Replace working directory paths (fallback)
            const workingDir = process.cwd();
            if (
                stringValue.includes(workingDir) &&
                !stringValue.includes("<snapshot>") &&
                !stringValue.includes("<test-dir>") &&
                !stringValue.includes("<rule_modules>")
            ) {
                stringValue = stringValue.replace(new RegExp(escapeRegExp(workingDir), "g"), "<cwd>");
                stringValue = normalizePath(stringValue);
            }

            return stringValue;
        }
        return value;
    };
}

/**
 * Escape special regex characters in a string
 */
function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Normalize paths in structured content
 */
function normalizeStructuredPaths(obj: unknown, snapshotDir: string): unknown {
    if (Array.isArray(obj)) {
        return obj.map((item) => normalizeStructuredPaths(item, snapshotDir));
    } else if (obj && typeof obj === "object") {
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
            if (key === "filePath" && typeof value === "string") {
                // Normalize filePath specifically
                let normalizedPath = value;

                // Handle cross-platform test directory paths
                const testDirPattern =
                    /.*[\/\\]test[\/\\]mcp-snapshot-test[\/\\]snapshots[\/\\]([^[\/\\]]+[\/\\][^"]*)/;
                const snapshotMatch = normalizedPath.match(testDirPattern);
                if (snapshotMatch) {
                    normalizedPath = `<snapshot>/${snapshotMatch[1].replace(/\\/g, "/")}`;
                } else if (normalizedPath.includes("snapshots")) {
                    // Fallback for other snapshot patterns
                    const parts = normalizedPath.split(/[\/\\]/);
                    const snapshotIndex = parts.findIndex((part) => part === "snapshots");
                    if (snapshotIndex >= 0 && snapshotIndex < parts.length - 2) {
                        normalizedPath = `<snapshot>/${parts.slice(snapshotIndex + 2).join("/")}`;
                    }
                }

                result[key] = normalizedPath;
            } else {
                result[key] = normalizeStructuredPaths(value, snapshotDir);
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
export function resolveRequestPaths(request: unknown, snapshotDir: string): unknown {
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

    return resolved as unknown;
}

/**
 * Check if UPDATE_SNAPSHOT environment variable is set
 */
export function shouldUpdateSnapshots(): boolean {
    return process.env.UPDATE_SNAPSHOT === "1";
}
