import fs from "node:fs/promises";
import debug0 from "debug";

const debug = debug0("textlint:find-util");
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
    const readdir = (await import("tiny-readdir-glob-gitignore")).default;
    const cwd = options.cwd ?? process.cwd();
    debug("search patterns: %o", patterns);
    const noIgnore = !options.ignoreFilePath;
    const filesWithoutGlob = patterns.filter((pattern) => {
        return pattern.indexOf("*") === -1;
    });
    const filesWithGlob = patterns.filter((pattern) => {
        return pattern.indexOf("*") !== -1;
    });
    const result = await readdir(filesWithGlob, {
        cwd,
        depth: 20, // Maximum depth to look at
        limit: 1_000_000, // Maximum number of files explored, useful as a stop gap in some edge cases
        followSymlinks: false, // Whether to follow symlinks or not
        ignore: ["**/.git", "**/node_modules"], // Globs, or raw function, that if returns true will ignore this particular file or a directory and its descendants
        ignoreFiles: noIgnore ? [] : [".textlintignore"], // List of .gitignore-like files to look for, defaults to ['.gitignore']
        ignoreFilesFindAbove: false, // Whether to look for .gitignore-like files in parent directories also, defaults to true
        ignoreFilesFindBetween: true, // Whether to look for .gitignore-like files between the "cwd" directory, and the actual search directories, which due to some optimizations could not be the same
        ignoreFilesStrictly: false // Whether to strictly follow the rules in .gitignore-like files, even if they exclude the folder you are explicitly searching into, defaults to false
    });
    const totalFiles = [...filesWithoutGlob, ...result.files];
    debug("results files: %o", totalFiles);
    if (totalFiles.length > 0) {
        return {
            ok: true,
            items: totalFiles
        };
    }
    const resultWithoutIgnoreFile = await readdir(filesWithGlob, {
        cwd,
        depth: 20,
        limit: 1_000_000,
        followSymlinks: false,
        ignore: ["**/.git", "**/node_modules"],
        ignoreFiles: [],
        ignoreFilesFindAbove: false, // Whether to look for .gitignore-like files in parent directories also, defaults to true
        ignoreFilesFindBetween: false, // Whether to look for .gitignore-like files between the "cwd" directory, and the actual search directories, which due to some optimizations could not be the same
        ignoreFilesStrictly: false // Whether to strictly follow the rules in .gitignore-like files, even if they exclude the folder you are explicitly searching into, defaults to false
    });
    const isEmptyResultByIgnoreFile = result.files === 0 && resultWithoutIgnoreFile.length > 0;
    if (isEmptyResultByIgnoreFile) {
        debug("found files but it is ignored by ignore file: %o", result);
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
