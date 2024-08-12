import fs from "node:fs/promises";
import debug0 from "debug";
import path from "path";
import { glob } from "glob";

const debug = debug0("textlint:find-util");
const DEFAULT_IGNORE_PATTERNS = ["**/.git/**", "**/node_modules/**"];
export type SearchFilesOptions = {
    cwd: string;
    ignoreFilePath?: string;
};

export type SearchFilesNoTargetFileError = {
    type: "SearchFilesNoTargetFileError";
};
export type SearchFilesResultError = SearchFilesNoTargetFileError;
export type SearchFilesResult =
    | {
          ok: true;
          items: string[];
      }
    | {
          ok: false;
          errors: SearchFilesResultError[];
      };
const mapGitIgnorePatternTo = (base: string) => (ignore: string) => {
    if (ignore[0] === "!") {
        return `!${path.posix.join(base, ignore.slice(1))}`;
    }
    return path.posix.join(base, ignore);
};
const createIgnorePatterns = async (cwd: string, ignoreFilePath: string): Promise<string[]> => {
    const normalizeIgnoreFilePath = path.resolve(cwd, ignoreFilePath);
    // baseDir is used for glob pattern
    const baseDir = path.posix.resolve(cwd, path.posix.dirname(ignoreFilePath));
    debug("findFiles ignore baseDir: %s, normalizeIgnoreFilePath: %s", cwd, normalizeIgnoreFilePath);
    const exists = await fs.stat(normalizeIgnoreFilePath).catch(() => null);
    if (!exists) {
        return [];
    }
    const ignoreFileContent = await fs.readFile(normalizeIgnoreFilePath, "utf-8");
    return ignoreFileContent
        .split(/\r?\n/)
        .filter((line: string) => !/^\s*$/.test(line) && !/^\s*#/.test(line))
        .map(mapGitIgnorePatternTo(baseDir));
};
/**
 * globby wrapper that support ignore options
 * @param patterns
 * @param options
 */
export const searchFiles = async (patterns: string[], options: SearchFilesOptions): Promise<SearchFilesResult> => {
    const cwd = options.cwd ?? process.cwd();
    const ignoredPatterns: string[] = [
        ...DEFAULT_IGNORE_PATTERNS,
        ...(options.ignoreFilePath ? await createIgnorePatterns(cwd, options.ignoreFilePath) : [])
    ];
    debug("search patterns: %o", patterns);
    console.debug("search ignore patterns: %o", ignoredPatterns);
    const files = await glob(patterns, {
        cwd,
        absolute: true,
        nodir: true,
        dot: true,
        ignore: ignoredPatterns
    });
    if (files.length > 0) {
        debug("found files: %o", files);
        return {
            ok: true,
            items: files
        };
    }
    // If ignore file is matched and result is empty, it should be ignored
    const isEmptyResultByIgnoreFile =
        files.length === 0 &&
        (
            await glob(patterns, {
                cwd,
                absolute: true,
                nodir: true,
                dot: true
                // no ignore
            })
        ).length !== 0;
    if (isEmptyResultByIgnoreFile) {
        return {
            ok: true,
            items: []
        };
    }
    // Not found target file
    return {
        ok: false,
        errors: [
            {
                type: "SearchFilesNoTargetFileError"
            }
        ]
    };
};

export type ScanFilePathNoExistFileError = {
    type: "ScanFilePathNoExistFileError";
};
export type ScanFilePathResultError = ScanFilePathNoExistFileError | SearchFilesResultError;
export type ScanFilePathResult =
    | {
          // Found target file
          status: "ok";
      }
    | {
          // Found target file but it is ignored by ignore file
          status: "ignored";
      }
    | {
          // Not found target file
          status: "error";
          errors: ScanFilePathResultError[];
      };
/**
 * Scan file path and return the file is target or not
 * @param filePath
 * @param options
 */
export const scanFilePath = async (filePath: string, options: SearchFilesOptions): Promise<ScanFilePathResult> => {
    const exists = await fs.stat(filePath).catch(() => null);
    if (!exists) {
        return {
            status: "error",
            errors: [
                {
                    type: "ScanFilePathNoExistFileError"
                }
            ]
        };
    }
    const searchResult = await searchFiles([filePath], options);
    if (!searchResult.ok) {
        return {
            status: "error",
            errors: searchResult.errors
        };
    }
    if (searchResult.items.length === 0) {
        return {
            status: "ignored"
        };
    }
    return {
        status: "ok"
    };
};
