import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import type { SnapshotInput, SnapshotOutput, McpResponse } from "./types.js";

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

            // Handle JSON strings first to catch timestamps in content field
            if (stringValue.includes("\n") && (stringValue.includes('{"') || stringValue.includes('"timestamp":'))) {
                // This is likely a JSON string, normalize timestamps within it
                stringValue = stringValue.replace(/"timestamp":\s*"[^"]*"/g, '"timestamp": "<timestamp>"');

                // Also normalize paths in JSON strings - handle both Unix and Windows paths
                // Replace any absolute path that contains "test/mcp-snapshot-test/snapshots"
                stringValue = stringValue.replace(
                    /"[^"]*[\/\\]test[\/\\]mcp-snapshot-test[\/\\]snapshots[\/\\]([^"]*)"/g,
                    '"<test-dir>/snapshots/$1"'
                );
            }

            // Replace __dirname based paths (test directory base) - cross-platform
            const testDirPattern = /[\/\\]test[\/\\]mcp-snapshot-test(?:[\/\\]|$)/;
            if (testDirPattern.test(stringValue)) {
                // Check if this contains snapshots directory
                if (stringValue.includes("snapshots")) {
                    // Extract relative path from snapshots directory
                    const snapshotMatch = stringValue.match(/.*[\/\\]snapshots[\/\\]([^[\/\\]]+[\/\\][^"]*)/);
                    if (snapshotMatch) {
                        stringValue = `<snapshot>/${snapshotMatch[1].replace(/\\/g, "/")}`;
                    }
                } else {
                    // Replace with test-dir placeholder
                    stringValue = stringValue.replace(/.*[\/\\]test[\/\\]mcp-snapshot-test/, "<test-dir>");
                    stringValue = normalizePath(stringValue);
                }
            }

            // Fallback: Replace __dirname if it matches exactly (for local development)
            if (stringValue.includes(__dirname)) {
                const relativePath = path.relative(__dirname, stringValue);
                if (relativePath.startsWith("snapshots/")) {
                    // Extract the filename from snapshots/case-name/filename.ext
                    const pathParts = relativePath.split(path.sep);
                    if (pathParts.length >= 3) {
                        stringValue = `<snapshot>/${pathParts.slice(2).join("/")}`;
                    }
                } else {
                    stringValue = normalizePath(stringValue.replace(__dirname, "<test-dir>"));
                }
            }

            // Replace fake modules directory paths
            if (stringValue.includes(FAKE_MODULES_DIRECTORY)) {
                stringValue = normalizePath(stringValue.replace(FAKE_MODULES_DIRECTORY, "<rule_modules>"));
            }

            // Replace other absolute paths with working directory
            const workingDir = process.cwd();
            if (
                stringValue.includes(workingDir) &&
                !stringValue.includes("<snapshot>") &&
                !stringValue.includes("<rule_modules>") &&
                !stringValue.includes("<test-dir>")
            ) {
                stringValue = normalizePath(stringValue.replace(workingDir, "<cwd>"));
            }

            // Handle Windows absolute paths that weren't caught above
            if (/^[A-Za-z]:[\\]/.test(stringValue) && stringValue.includes("textlint")) {
                // This is a Windows absolute path, try to normalize it
                if (stringValue.includes("snapshots")) {
                    const snapshotMatch = stringValue.match(/.*[\/\\]snapshots[\/\\]([^[\/\\]]+[\/\\][^"]*)/);
                    if (snapshotMatch) {
                        stringValue = `<test-dir>/snapshots/${snapshotMatch[1].replace(/\\/g, "/")}`;
                    }
                } else if (stringValue.includes("test") && stringValue.includes("mcp-snapshot-test")) {
                    stringValue = stringValue.replace(/.*[\/\\]test[\/\\]mcp-snapshot-test/, "<test-dir>");
                    stringValue = normalizePath(stringValue);
                }
            }

            // Additional JSON string handling for any remaining paths
            if (stringValue.includes('{"') || stringValue.includes("[{") || stringValue.includes('"timestamp"')) {
                // Replace timestamps in JSON strings - use more comprehensive regex
                stringValue = stringValue.replace(/"timestamp":\s*"[^"]*"/g, '"timestamp": "<timestamp>"');

                // Handle any remaining test directory paths in JSON
                stringValue = stringValue.replace(
                    /"[^"]*[\/\\]test[\/\\]mcp-snapshot-test[\/\\]snapshots[\/\\]([^"]*)"/g,
                    '"<test-dir>/snapshots/$1"'
                );
            }

            return stringValue;
        }
        return value;
    };
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
 * Read input.json from snapshot directory
 */
export function readSnapshotInput(snapshotDir: string): SnapshotInput {
    const inputPath = path.join(snapshotDir, "input.json");
    if (!fs.existsSync(inputPath)) {
        throw new Error(`input.json not found in ${snapshotDir}`);
    }

    const content = fs.readFileSync(inputPath, "utf-8");
    return JSON.parse(content) as SnapshotInput;
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

    return resolved;
}

/**
 * Check if UPDATE_SNAPSHOT environment variable is set
 */
export function shouldUpdateSnapshots(): boolean {
    return process.env.UPDATE_SNAPSHOT === "1";
}
