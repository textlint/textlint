// LICENSE : MIT
"use strict";
import type { TextlintKernelOptions } from "@textlint/kernel";
import { TextlintKernel, TextlintKernelDescriptor, TextlintResult } from "@textlint/kernel";
import { findFiles, pathsToGlobPatterns, separateByAvailability } from "./util/find-util";
import { ExecuteFileBackerManager } from "./engine/execute-file-backer-manager";
import { CacheBacker } from "./engine/execute-file-backers/cache-backer";
import path from "path";
import crypto from "crypto";
// @ts-expect-error no types
import md5 from "md5";
import pkgConf from "read-pkg-up";
import fs from "fs/promises";
import { Logger } from "./util/logger";
import { TextlintFixResult } from "@textlint/types";
import debug0 from "debug";

const debug = debug0("textlint:createTextlint");
export const mergeDescriptors = (...descriptors: TextlintKernelDescriptor[]): TextlintKernelDescriptor => {
    if (descriptors.length <= 1) {
        return descriptors[0];
    }
    return descriptors.reduce((prev, current) => {
        return new TextlintKernelDescriptor({
            configBaseDir: current.configBaseDir ?? prev.configBaseDir,
            // FIXME: merge correctly
            rules: prev.rule.toKernelRulesFormat().concat(current.rule.toKernelRulesFormat()),
            filterRules: prev.filterRule
                .toKernelFilterRulesFormat()
                .concat(current.filterRule.toKernelFilterRulesFormat()),
            plugins: prev.plugin.toKernelPluginsFormat().concat(current.plugin.toKernelPluginsFormat())
        });
    });
};
export type CreateLinterOptions = {
    descriptor: TextlintKernelDescriptor; // available rules and plugins
    ignoreFile?: string;
    quiet?: boolean;
    cache: boolean;
    cacheLocation: string;
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
    const executeFileBackerManger = new ExecuteFileBackerManager();
    const cacheBaker = new CacheBacker({
        cache: options.cache,
        cacheLocation: options.cacheLocation,
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
    const baseOptions: Pick<TextlintKernelOptions, "configBaseDir" | "plugins" | "rules" | "filterRules"> = {
        configBaseDir: options.descriptor.configBaseDir,
        plugins: options.descriptor.plugin.toKernelPluginsFormat(),
        rules: options.descriptor.rule.toKernelRulesFormat(),
        filterRules: options.descriptor.filterRule.toKernelFilterRulesFormat()
    };
    return {
        /**
         * Executes the current configuration on an array of file and directory names.
         * @param {String[]}  files An array of file and directory names.
         * @returns {Promise<TextlintResult[]>} The results for all files that were linted.
         */
        async lintFiles(files: string[]): Promise<TextlintResult[]> {
            const patterns = pathsToGlobPatterns(files, {
                extensions: options.descriptor.availableExtensions
            });
            const targetFiles = findFiles(patterns, {
                ignoreFilePath: options.ignoreFile
            });
            const { availableFiles, unAvailableFiles } = separateByAvailability(targetFiles, {
                extensions: options.descriptor.availableExtensions
            });
            debug("Process files", availableFiles);
            debug("No Process files that are un-support extensions:", unAvailableFiles);
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
        async lintText(text: string, filePath: string): Promise<TextlintResult> {
            const kernelOptions = {
                ext: path.extname(filePath),
                filePath,
                ...baseOptions
            };
            return kernel.lintText(text, kernelOptions);
        },
        // fix files
        async fixFiles(files: string[]): Promise<TextlintFixResult[]> {
            const patterns = pathsToGlobPatterns(files, {
                extensions: options.descriptor.availableExtensions
            });
            const targetFiles = findFiles(patterns, {
                ignoreFilePath: options.ignoreFile
            });
            const { availableFiles, unAvailableFiles } = separateByAvailability(targetFiles, {
                extensions: options.descriptor.availableExtensions
            });
            debug("Process files", availableFiles);
            debug("No Process files that are un-support extensions:", unAvailableFiles);
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
        async fixText(text: string, filePath: string): Promise<TextlintFixResult> {
            const kernelOptions = {
                ext: path.extname(filePath),
                filePath,
                ...baseOptions
            };
            return kernel.fixText(text, kernelOptions);
        }
    };
};
