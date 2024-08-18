// LICENSE : MIT
"use strict";
import { pathToGlobPattern } from "path-to-glob-pattern";
import * as glob from "glob";
import path from "path";
import fs from "fs";
import debug0 from "debug";

const debug = debug0("textlint:find-util");
const DEFAULT_IGNORE_PATTERNS = Object.freeze(["**/.git/**", "**/node_modules/**"]);
export type FindFilesOptions = {
    cwd?: string;
    ignoreFilePath?: string;
};
const isFile = (filePath: string) => {
    try {
        return fs.statSync(filePath).isFile();
    } catch (error) {
        return false;
    }
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
 * found files by glob pattern
 * @param {string[]} patterns
 * @param {FindFilesOptions} options
 * @returns {string[]} file path list
 */
export function findFiles(patterns: string[], options: FindFilesOptions = {}): string[] {
    const cwd = options.cwd || process.cwd();
    const ignoredPatterns: string[] = [];
    ignoredPatterns.push(...DEFAULT_IGNORE_PATTERNS);
    if (options.ignoreFilePath) {
        const normalizeIgnoreFilePath = path.resolve(cwd, options.ignoreFilePath);
        if (fs.existsSync(normalizeIgnoreFilePath)) {
            debug("findFiles ignore, normalizeIgnoreFilePath: %s", normalizeIgnoreFilePath);
            const ignored = fs
                .readFileSync(normalizeIgnoreFilePath, "utf-8")
                .split(/\r?\n/)
                .filter((line: string) => !/^\s*$/.test(line) && !/^\s*#/.test(line));
            debug("add ignored pattern: %o", ignored);
            ignoredPatterns.push(...ignored);
        }
    }
    debug("search patterns: %o", patterns);
    debug("search ignore patterns: %o", ignoredPatterns);
    const files: string[] = [];
    const addFile = (filePath: string) => {
        if (files.indexOf(filePath) === -1) {
            files.push(filePath);
        }
    };
    patterns.forEach((pattern) => {
        const file = path.resolve(cwd, pattern);
        if (isFile(file)) {
            addFile(fs.realpathSync(file));
        } else {
            glob.sync(pattern, {
                cwd,
                absolute: true,
                nodir: true,
                ignore: ignoredPatterns
            }).forEach((filePath: string) => {
                // workaround for windows
                // https://github.com/isaacs/node-glob/issues/74#issuecomment-31548810
                addFile(path.resolve(filePath));
            });
        }
    });
    return files;
}
