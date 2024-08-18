// LICENSE : MIT
"use strict";
import { TextlintKernel, TextlintKernelDescriptor, TextlintResult } from "@textlint/kernel";
import { findFiles, pathsToGlobPatterns } from "./util/old-find-util";
import { ExecuteFileBackerManager } from "./engine/execute-file-backer-manager";
import { CacheBacker } from "./engine/execute-file-backers/cache-backer";
import path from "path";
import crypto from "crypto";
import pkgConf from "read-pkg-up";
import fs from "fs/promises";
import { Logger } from "./util/logger";
import { TextlintFixResult } from "@textlint/types";
import debug0 from "debug";
import { separateByAvailability } from "./util/separate-by-availability";
import { scanFilePath, ScanFilePathResult } from "./util/find-util";

const debug = debug0("textlint:createTextlint");
export type CreateLinterOptions = {
    // You can get config descriptor from `loadTextlintrc()`
    descriptor: TextlintKernelDescriptor;
    ignoreFilePath?: string;
    quiet?: boolean;
    cache?: boolean;
    cacheLocation?: string;
    /**
     * The current working directory
     */
    cwd?: string;
};
const createHashForDescriptor = (descriptor: TextlintKernelDescriptor): string => {
    try {
        const version = pkgConf.sync({ cwd: __dirname }).pkg.version;
        const toString = JSON.stringify(descriptor.toJSON());
        const md5 = crypto.createHash("md5");
        return md5.update(`${version}-${toString}`, "utf8").digest("hex");
    } catch (error) {
        // Fallback for some env
        // https://github.com/textlint/textlint/issues/597
        Logger.warn("Use random value as hash because calculating hash value throw error", error);
        return crypto.randomBytes(20).toString("hex");
    }
};
export const createLinter = (options: CreateLinterOptions) => {
    const cwd = options.cwd ?? process.cwd();
    const executeFileBackerManger = new ExecuteFileBackerManager();
    const cacheBaker = new CacheBacker({
        cache: options.cache ?? false,
        cacheLocation: options.cacheLocation ?? path.resolve(process.cwd(), ".textlintcache"),
        hash: createHashForDescriptor(options.descriptor)
    });
    if (options.cache) {
        executeFileBackerManger.add(cacheBaker);
    } else {
        cacheBaker.destroyCache();
    }
    const kernel = new TextlintKernel({
        quiet: options.quiet
    });
    const baseOptions = options.descriptor.toKernelOptions();
    return {
        /**
         * Lint files
         * Note: lintFiles respect ignore file
         * @param {String[]} filesOrGlobs An array of file path and directory names, or glob.
         * @returns {Promise<TextlintResult[]>} The results for all files that were linted.
         */
        async lintFiles(filesOrGlobs: string[]): Promise<TextlintResult[]> {
            const patterns = pathsToGlobPatterns(filesOrGlobs, {
                extensions: options.descriptor.availableExtensions
            });
            const targetFiles = findFiles(patterns, {
                ignoreFilePath: options.ignoreFilePath
            });
            const { availableFiles, unAvailableFiles } = separateByAvailability(targetFiles, {
                extensions: options.descriptor.availableExtensions
            });
            debug("Available extensions: %j", options.descriptor.availableExtensions);
            debug("Process files: %j", availableFiles);
            debug("No Process files that are un-support extensions: %j", unAvailableFiles);
            return executeFileBackerManger.process(availableFiles, async (filePath) => {
                const absoluteFilePath = path.resolve(process.cwd(), filePath);
                const fileContent = await fs.readFile(filePath, "utf-8");
                const kernelOptions = {
                    ext: path.extname(filePath),
                    filePath: absoluteFilePath,
                    ...baseOptions
                };
                return kernel.lintText(fileContent, kernelOptions);
            });
        },
        /**
         * Lint text
         * Note: lintText does not respect ignore file
         * You can detect the file path is ignored or not by `scanFilePath()`
         * @param text
         * @param filePath
         */
        async lintText(text: string, filePath: string): Promise<TextlintResult> {
            const kernelOptions = {
                ext: path.extname(filePath),
                filePath,
                ...baseOptions
            };
            return kernel.lintText(text, kernelOptions);
        },
        /**
         * Lint files and fix them
         * Note: fixFiles respect ignore file
         * @param fileOrGlobs An array of file path and directory names, or glob.
         * @returns {Promise<TextlintFixResult[]>} The results for all files that were linted and fixed.
         */
        async fixFiles(fileOrGlobs: string[]): Promise<TextlintFixResult[]> {
            const patterns = pathsToGlobPatterns(fileOrGlobs, {
                extensions: options.descriptor.availableExtensions
            });
            const targetFiles = findFiles(patterns, {
                ignoreFilePath: options.ignoreFilePath
            });
            const { availableFiles, unAvailableFiles } = separateByAvailability(targetFiles, {
                extensions: options.descriptor.availableExtensions
            });
            debug("Available extensions: %j", options.descriptor.availableExtensions);
            debug("Process files: %j", availableFiles);
            debug("No Process files that are un-support extensions: %j", unAvailableFiles);
            return executeFileBackerManger.process(availableFiles, async (filePath) => {
                const absoluteFilePath = path.resolve(process.cwd(), filePath);
                const fileContent = await fs.readFile(filePath, "utf-8");
                const kernelOptions = {
                    ext: path.extname(filePath),
                    filePath: absoluteFilePath,
                    ...baseOptions
                };
                return kernel.fixText(fileContent, kernelOptions);
            });
        },
        /**
         * Lint text and fix it
         * Note: fixText does not respect ignore file
         * You can detect the file path is ignored or not by `scanFilePath()`
         * @param text
         * @param filePath
         */
        async fixText(text: string, filePath: string): Promise<TextlintFixResult> {
            const kernelOptions = {
                ext: path.extname(filePath),
                filePath,
                ...baseOptions
            };
            return kernel.fixText(text, kernelOptions);
        },
        /**
         * Scan file path and return scan result
         * If you want to know the file is ignored by ignore file, use this function
         * Return { status "ok" | "ignored" | "error" } object:
         * - ok: found file and allow to lint/fix
         * - ignored: found file, and it is ignored by ignore file
         * - error: not found file
         * @param filePath
         * @returns {Promise<ScanFilePathResult>}
         */
        async scanFilePath(filePath: string): Promise<ScanFilePathResult> {
            return scanFilePath(filePath, {
                cwd,
                ignoreFilePath: options.ignoreFilePath
            });
        }
    };
};
