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

            // Replace snapshot directory paths
            if (stringValue.includes(snapshotDir)) {
                stringValue = normalizePath(stringValue.replace(snapshotDir, "<snapshot>"));
            }

            // Replace fake modules directory paths
            if (stringValue.includes(FAKE_MODULES_DIRECTORY)) {
                stringValue = normalizePath(stringValue.replace(FAKE_MODULES_DIRECTORY, "<rule_modules>"));
            }

            // Replace other absolute paths
            const workingDir = process.cwd();
            if (stringValue.includes(workingDir)) {
                stringValue = normalizePath(stringValue.replace(workingDir, "<cwd>"));
            }

            // Handle JSON strings that contain timestamps
            if (stringValue.includes('"timestamp"')) {
                try {
                    // Try to parse as JSON and replace timestamps in it
                    const parsed = JSON.parse(stringValue);
                    const cleanedJson = removeTimestamps(parsed);
                    stringValue = JSON.stringify(cleanedJson, null, 2);
                } catch {
                    // If not valid JSON, use regex replacement
                    stringValue = stringValue.replace(/"timestamp":\s*"[^"]*"/g, '"timestamp": "<timestamp>"');
                }
            }

            return stringValue;
        }
        return value;
    };
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
    return path.sep === "\\" ? value.replace(/\\/g, "/") : value;
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
