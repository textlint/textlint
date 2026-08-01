// MIT © 2016 azu
"use strict";
import fileEntryCache, { FileEntryCache } from "file-entry-cache";
import debug0 from "debug";
import fs from "node:fs";
import { AbstractBacker } from "./abstruct-backer.js";
import { TextlintResult } from "@textlint/kernel";

const debug = debug0("textlint:CacheBacker");

export type CacheBackerOptions = {
    /**
     * enable cache
     */
    cache: boolean;
    /**
     * path to cache file
     */
    cacheLocation: string;
    /**
     * Config hash value
     */
    hash: string;
    /**
     * Cache strategy for detecting changed files.
     * - "metadata": use file mtime and size (fast, not CI-safe)
     * - "content": use file content hash (accurate, CI-safe)
     */
    cacheStrategy: "metadata" | "content";
};
type FileEntryCacheCustomData = {
    hashOfConfig: string;
};

const createFileEntryCache = (cacheLocation: string, strategy: "metadata" | "content"): FileEntryCache => {
    const useCheckSum = strategy === "content";
    const createCache = (): FileEntryCache => {
        const fileCache = fileEntryCache.createFromFile(cacheLocation, useCheckSum);
        // file-entry-cache defaults `useModifiedTime` to true, but the "content" strategy must
        // detect changes by content hash only. Comparing mtime would invalidate the whole cache
        // in CI because checkout changes mtime while the content stays the same.
        fileCache.useModifiedTime = !useCheckSum;
        return fileCache;
    };
    try {
        return createCache();
    } catch (error) {
        debug(`Failed to create fileEntryCache, cacheLocation: ${cacheLocation}`, error);
        // remove old cache file and retry
        try {
            fs.unlinkSync(cacheLocation);
        } catch (error) {
            debug(`Failed to remove cache file, cacheLocation: ${cacheLocation}`, error);
        }
        return createCache();
    }
};

export class CacheBacker implements AbstractBacker {
    private fileCache: FileEntryCache;
    private isEnabled: boolean;

    constructor(private config: CacheBackerOptions) {
        this.isEnabled = config.cache;
        this.fileCache = createFileEntryCache(config.cacheLocation, config.cacheStrategy);
    }

    /**
     * @param {string} filePath
     * @returns {boolean}
     */
    shouldExecute({ filePath }: { filePath: string }) {
        if (!this.isEnabled) {
            return true;
        }
        try {
            const descriptor = this.fileCache.getFileDescriptor(filePath);
            const meta = descriptor.meta || {};
            // if the config is changed or file is changed, should execute return true
            const isChanged =
                descriptor.changed || (meta.data as FileEntryCacheCustomData).hashOfConfig !== this.config.hash;
            debug(`Skipping file since hasn't changed: ${filePath}`);
            return isChanged;
        } catch (error) {
            debug(`shouldExecute: Failed to read cache file: ${filePath}`, error);
            return true; // if cache file version is changed, it may throw an error
        }
    }

    didExecute<R extends TextlintResult>({ result }: { result: R }) {
        if (!this.isEnabled) {
            return;
        }
        const filePath = result.filePath;
        try {
            const descriptor = this.fileCache.getFileDescriptor(filePath);
            const meta = descriptor.meta || {};
            /*
             * if a file contains messages we don't want to store the file in the cache
             * so we can guarantee that next execution will also operate on this file
             */
            if (result.messages.length > 0) {
                debug(`File has problems, skipping it: ${filePath}`);
                // remove the entry from the cache
                this.fileCache.removeEntry(filePath);
            } else {
                // cache `config.hash`
                meta.data = { hashOfConfig: this.config.hash };
            }
        } catch (error) {
            debug(`didExecute: Failed to read cache file: ${filePath}`, error);
        }
    }

    /**
     * destroy all cache
     */
    destroyCache() {
        this.fileCache.destroy();
    }

    afterAll() {
        // persist cache
        this.fileCache.reconcile();
    }
}
