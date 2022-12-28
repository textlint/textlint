// LICENSE : MIT
"use strict";
import { TextlintKernel, TextlintKernelDescriptor, TextlintResult } from "@textlint/kernel";
import { findFiles, pathsToGlobPatterns, separateByAvailability } from "./util/find-util";
import { ExecuteFileBackerManager } from "./engine/execute-file-backer-manager";
import { CacheBacker } from "./engine/execute-file-backers/cache-backer";
import path from "path";
import crypto from "crypto";
// @ts-expect-error no types
import md5 from "md5";
// @ts-expect-error no types
import pkgConf from "read-pkg-up";
import fs from "fs/promises";
import { Logger } from "./util/logger";
import { TextlintKernelOptions } from "@textlint/kernel/lib/src/textlint-kernel-interface";
import { TextlintFixResult } from "@textlint/types";

const debug = require("debug")("textlint:engine-core");

export type TextlintConfig = {};

export type TextlintConfigLoader = () => TextlintConfig;
export const createCliLoader = (): Promise<TextlintKernelDescriptor> => {};
export const createTextlintrc = (): Promise<{ configBaseDir: string; descriptor: TextlintKernelDescriptor }> => {};
export const mergeDescriptors = (...descriptors: TextlintKernelDescriptor[]): TextlintKernelDescriptor => {
    if (descriptors.length <= 1) {
        return descriptors[0];
    }
    return descriptors.reduce((prev, current) => {
        return prev.shallowMerge({
            rules: current.rule.toKernelRulesFormat(),
            filterRules: current.filterRule.toKernelFilterRulesFormat(),
            plugins: current.plugin.toKernelPluginsFormat()
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
        return md5(`${version}-${toString}`);
    } catch (error) {
        // Fallback for some env
        // https://github.com/textlint/textlint/issues/597
        Logger.warn("Use random value as hash because calculating hash value throw error", error);
        return crypto.randomBytes(20).toString("hex");
    }
};
export const createLinter = (options: CreateLinterOptions) => {
    const executeFileBackerManger = new ExecuteFileBackerManager();
    const cacheLocation = options.cacheLocation || path.join(process.cwd(), ".textlintcache");
    const cacheBaker = new CacheBacker({
        cache: options.cache,
        cacheLocation,
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
        }
    };
};

export const loadFormatter = (formatterName: string) => {
    const formatter = loadFormatterByName(formatterName);
    return {
        // format results
    };
};
