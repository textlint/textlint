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
const createIgnorePatterns = async (cwd: string, ignoreFilePath: string): Promise<string[]> => {
    try {
        const normalizeIgnoreFilePath = path.resolve(cwd, ignoreFilePath);
        const ignoreFileContent = await fs.readFile(normalizeIgnoreFilePath, "utf-8");
        return ignoreFileContent.split(/\r?\n/).filter((line: string) => !/^\s*$/.test(line) && !/^\s*#/.test(line));
    } catch (error) {
        throw new Error(`Failed to read ignore file: ${ignoreFilePath}`, {
            cause: error
        });
    }
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
    debug("search ignore patterns: %o", ignoredPatterns);
    // Glob support file path, we can pass file path directly
    // https://github.com/azu/node-glob-example
    // TODO: add pathsToGlobPatterns here
    const files = await glob(patterns, {
        cwd,
        absolute: true,
        nodir: true,
        dot: true,
        ignore: ignoredPatterns
    });
    debug("found files: %o", files);
    if (files.length > 0) {
        return {
            ok: true,
            items: files
        };
    }
    // If ignore file is matched and result is empty, it should be ignored
    const filesWithoutIgnoreFiles = await glob(patterns, {
        cwd,
        absolute: true,
        nodir: true,
        dot: true
        // no ignore
    });
    const isEmptyResultByIgnoreFile = files.length === 0 && filesWithoutIgnoreFiles.length !== 0;
    if (isEmptyResultByIgnoreFile) {
        debug("all files are ignored by ignore files. ignored files: %o", filesWithoutIgnoreFiles);
        return {
            ok: true,
            items: []
        };
    }
    // Not found target file
    debug("Not found target file");
    return {
        ok: false,
        errors: [
            {
                type: "SearchFilesNoTargetFileError"
            }
        ]
    };
};

export type ScanFilePathNoExistFilePathError = {
    type: "ScanFilePathNoExistFilePathError";
    filePath: string;
};
export type ScanFilePathResultError = ScanFilePathNoExistFilePathError | SearchFilesResultError;
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
                    type: "ScanFilePathNoExistFilePathError",
                    filePath
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
