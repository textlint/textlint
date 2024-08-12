import fs from "node:fs/promises";
import debug0 from "debug";
import path from "path";

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
/**
 * globby wrapper that support ignore options
 * @param patterns
 * @param options
 */
export const searchFiles = async (patterns: string[], options: SearchFilesOptions): Promise<SearchFilesResult> => {
    const { globby, isDynamicPattern, convertPathToPattern } = await import("globby");
    // textlint support glob pattern
    const normalizedPatterns = patterns.map((pattern) => {
        // glob can not handle Windows style path separator
        // So, replace path separator to POSIX style
        // https://github.com/secretlint/secretlint/issues/816
        const normalizedPattern = process.platform === "win32" ? pattern.replace(/\\/g, "/") : pattern;
        // isDynamicPattern arguments should be posix path
        // isDynamicPattern("C:\\path\\to\\file") => true
        // If pattern includes glob pattern, just return `pattern`
        // Because user need to use `textlint "**/*"` in any platform(Windows, macOS, Linux)
        const isPatternGlobStyle = isDynamicPattern(normalizedPattern);
        if (isPatternGlobStyle) {
            return {
                pattern,
                isDynamic: true
            };
        }
        // static path should be escaped special characters
        return {
            pattern: convertPathToPattern(normalizedPattern),
            isDynamic: false
        };
    });
    debug("search patterns: %o", normalizedPatterns);
    debug("search DEFAULT_IGNORE_PATTERNS: %o", DEFAULT_IGNORE_PATTERNS);
    debug("search ignoreFilePath: %s", options.ignoreFilePath);
    const existsIgnoreFile = options.ignoreFilePath ? await fs.stat(options.ignoreFilePath).catch(() => null) : null;
    if (existsIgnoreFile) {
        console.log("search ignore file exists: %s", options.ignoreFilePath);
    }
    const relativeIgnoreFilePath = options.ignoreFilePath ? path.relative(options.cwd, options.ignoreFilePath) : null;
    if (options.ignoreFilePath) {
        const com = path.relative(options.cwd, path.dirname(options.ignoreFilePath));
        console.log({
            cwd: options.cwd,
            com,
            relativeIgnoreFilePath
        });
        console.log("existsIgnoreFile: %o", await fs.stat(com).catch(() => null));
    }
    const globPatterns = normalizedPatterns.map((pattern) => pattern.pattern);
    const searchResultItems = await globby(globPatterns, {
        cwd: options.cwd,
        ignore: DEFAULT_IGNORE_PATTERNS,
        ignoreFiles: relativeIgnoreFilePath ? [relativeIgnoreFilePath] : undefined,
        dot: true,
        absolute: true,
        onlyFiles: true
    });
    if (searchResultItems.length > 0) {
        return {
            ok: true,
            items: searchResultItems
        };
    }
    /**
     * If search result is empty, and it is caused by ignoring files, return { ok : true }
     * It aim to avoid error that is caused by ignore files and not found target file.
     * Otherwise, When user specific non-exist file, it should return { ok : false }
     */
    const isEmptyResultIsHappenByIgnoreFile =
        (
            await globby(globPatterns, {
                ignore: DEFAULT_IGNORE_PATTERNS,
                cwd: options.cwd,
                dot: true
            })
        ).length > 0;
    if (isEmptyResultIsHappenByIgnoreFile) {
        return {
            ok: true,
            items: []
        };
    }
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
    console.log("scanFilePath: %o", searchResult);
    return {
        status: "ok"
    };
};
