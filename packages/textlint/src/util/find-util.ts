// LICENSE : MIT
"use strict";
import { pathToGlobPattern } from "path-to-glob-pattern";
import debug0 from "debug";

const debug = debug0("textlint:find-util");
const DEFAULT_IGNORE_PATTERNS = ["**/.git/**", "**/node_modules/**"];
export type FindFilesOptions = {
    cwd?: string;
    ignoreFilePath?: string;
};

/**
 * filter files by config
 * @param {string[]} patterns glob patterns
 * @param {{extensions?: string[], cwd?: string }} options
 */
export function pathsToGlobPatterns(
    patterns: string[],
    options: { extensions?: string[]; cwd?: string } = {}
): string[] {
    const processPatterns = pathToGlobPattern({
        extensions: options.extensions || [],
        cwd: options.cwd || process.cwd()
    });
    return patterns.map(processPatterns);
}

/**
 * find files by glob pattern
 * @param {string[]} patterns
 * @param {FindFilesOptions} options
 * @returns {string[]} file path list
 */
export async function findFiles(patterns: string[], options: FindFilesOptions = {}): Promise<string[]> {
    const cwd = options.cwd || process.cwd();
    const { globby } = await import("globby");
    const ignoreFiles = options.ignoreFilePath ? [options.ignoreFilePath] : [];
    debug("find files by glob patterns", patterns);
    debug("ignore files %o", ignoreFiles);
    return globby(patterns, {
        cwd,
        absolute: true,
        dot: true,
        onlyFiles: true,
        ignore: DEFAULT_IGNORE_PATTERNS,
        ignoreFiles
    });
}

/**
 * Check the file is ignored by ignore file like .textlintignore
 * @param filePath
 * @param options
 */
export async function isFilePathIgnored(filePath: string, options: FindFilesOptions = {}): Promise<boolean> {
    const results = await findFiles([filePath], options);
    return results.length === 0;
}
